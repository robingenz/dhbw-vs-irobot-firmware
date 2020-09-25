import * as fs from 'fs';
import {
    blobFromImageAsync,
    FONT_HERSHEY_SIMPLEX,
    imshow,
    LINE_8,
    Mat,
    Net,
    NMSBoxes,
    Point2,
    readNetFromDarknetAsync,
    Rect,
    ROTATE_180,
    Size,
    Vec3,
    waitKey,
} from 'opencv4nodejs';
import { Config } from '../config';

export interface ObjectDetection {
    label: string;
    coords: ObjectDetectionCoords;
    size: ObjectDetectionSize;
}

export interface ObjectDetectionCoords {
    x: number;
    y: number;
}

export interface ObjectDetectionSize {
    width: number;
    height: number;
}

export class ObjectDetector {
    private labels: string[] = [];
    private net: Net | undefined;
    private layerNames: string[] = [];

    private frameCounter = 0;

    constructor() {}

    public async init(cfgPath: string, weightsPath: string, labelsPath: string): Promise<void> {
        this.labels = fs.readFileSync(labelsPath).toString().split(/\r?\n/);
        this.net = await readNetFromDarknetAsync(cfgPath, weightsPath);
        const allLayerNames = this.net.getLayerNames();
        this.layerNames = this.net.getUnconnectedOutLayers().map(index => allLayerNames[index - 1]);
    }

    public async detectObjectsOnFrame(frame: Mat): Promise<ObjectDetection[]> {
        if (!this.net) {
            throw new Error('Object detection is not initialized.');
        }
        frame = frame.rotate(ROTATE_180);
        const size = new Size(Config.CAMERA_FRAME_WIDTH, Config.CAMERA_FRAME_HEIGHT);
        const vec3 = new Vec3(0, 0, 0);
        const [imgHeight, imgWidth] = frame.sizes;

        const startTime = Date.now();

        const inputBlob = await blobFromImageAsync(frame, 1 / 255.0, size, vec3, true, false);
        this.net.setInput(inputBlob);

        const layerOutputs = await this.net.forwardAsync(this.layerNames);

        const boxes: Rect[] = [];
        const confidences: number[] = [];
        const classIDs: number[] = [];

        for (const layerOutput of layerOutputs) {
            const output = layerOutput.getDataAsArray();
            for (const detection of output) {
                const scores = detection.slice(5);
                const classId = scores.indexOf(Math.max(...scores));
                const confidence = scores[classId];
                if (confidence > Config.OD_SCORE_THRESHOLD) {
                    const box = detection.slice(0, 4);
                    const centerX = box[0] * imgWidth;
                    const centerY = box[1] * imgHeight;
                    const width = box[2] * imgWidth;
                    const height = box[3] * imgHeight;
                    const x = centerX - width / 2;
                    const y = centerY - height / 2;
                    const rect = new Rect(x, y, width, height);
                    boxes.push(rect);
                    confidences.push(confidence);
                    classIDs.push(classId);
                }
            }
        }

        const indices = NMSBoxes(boxes, confidences, Config.OD_SCORE_THRESHOLD, Config.OD_NMS_THRESHOLD);
        const detectedObjects: ObjectDetection[] = [];
        for (const i of indices) {
            const rect = boxes[i];

            const pt1 = new Point2(rect.x, rect.y);
            const pt2 = new Point2(rect.x + rect.width, rect.y + rect.height);
            const rectColor = new Vec3(255, 0, 0);
            const rectThickness = 2;
            const rectLineType = LINE_8;

            frame.drawRectangle(pt1, pt2, rectColor, rectThickness, rectLineType);

            const text = `${this.labels[classIDs[i]]}: ${confidences[i]}`;
            const org = new Point2(rect.x, rect.y + 15);
            const fontFace = FONT_HERSHEY_SIMPLEX;
            const fontScale = 0.5;
            const textColor = new Vec3(123, 123, 255);
            const thickness = 2;

            frame.putText(text, org, fontFace, fontScale, textColor, thickness);

            const detectedObject: ObjectDetection = {
                label: this.labels[classIDs[i]],
                coords: {
                    x: rect.x + rect.width / 2,
                    y: rect.y + rect.height / 2,
                },
                size: {
                    width: rect.width,
                    height: rect.height,
                },
            };
            detectedObjects.push(detectedObject);
        }

        const endTime = Date.now();
        const currentFps = 1 / ((endTime - startTime) / 1000);
        // console.log(this.frameCounter++, `${currentFps} FPS`);

        imshow('Darknet YOLO Object Detection', frame);
        waitKey(1);

        return detectedObjects;
    }
}
