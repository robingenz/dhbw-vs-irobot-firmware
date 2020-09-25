const fs = require('fs');
const path = require('path');
const cv = require('opencv4nodejs');

if (!cv.modules.dnn) {
    throw new Error('exiting: opencv4nodejs compiled without dnn module');
}

const cfgFile = path.resolve(process.cwd(), 'assets', 'networks', '256x192-9', 'yolo-tiny-obj.cfg');
const weightsFile = path.resolve(process.cwd(), 'assets', 'networks', '256x192-9', 'yolo-tiny-obj_15000.weights');
const labelsFile = path.resolve(process.cwd(), 'assets', 'networks', '256x192-9', 'obj.names');

const minConfidence = 0.5;
const nmsThreshold = 0.4;

const width = 256;
const height = 192;

let frameCounter = 0;

if (!fs.existsSync(weightsFile) || !fs.existsSync(cfgFile) || !fs.existsSync(labelsFile)) {
    throw new Error('File not found.');
}

const labels = fs.readFileSync(labelsFile).toString().split(/\r?\n/);

const net = cv.readNetFromDarknet(cfgFile, weightsFile);
const allLayerNames = net.getLayerNames();
const unconnectedOutLayers = net.getUnconnectedOutLayers();

const layerNames = unconnectedOutLayers.map(layerIndex => {
    return allLayerNames[layerIndex - 1];
});

const classifyImg = img => {
    img = img.rotate(cv.ROTATE_180);
    const size = new cv.Size(width, height);
    const vec3 = new cv.Vec(0, 0, 0);
    const [imgHeight, imgWidth] = img.sizes;

    const startTime = Date.now();

    const inputBlob = cv.blobFromImage(img, 1 / 255.0, size, vec3, true, false);
    net.setInput(inputBlob);

    const layerOutputs = net.forward(layerNames);

    let boxes = [];
    let confidences = [];
    let classIDs = [];

    layerOutputs.forEach(mat => {
        const output = mat.getDataAsArray();
        output.forEach(detection => {
            const scores = detection.slice(5);
            const classId = scores.indexOf(Math.max(...scores));
            const confidence = scores[classId];

            if (confidence > minConfidence) {
                const box = detection.slice(0, 4);

                const centerX = parseInt(box[0] * imgWidth);
                const centerY = parseInt(box[1] * imgHeight);
                const width = parseInt(box[2] * imgWidth);
                const height = parseInt(box[3] * imgHeight);

                const x = parseInt(centerX - width / 2);
                const y = parseInt(centerY - height / 2);

                boxes.push(new cv.Rect(x, y, width, height));
                confidences.push(confidence);
                classIDs.push(classId);
            }
        });
    });

    const indices = cv.NMSBoxes(boxes, confidences, minConfidence, nmsThreshold);

    indices.forEach(i => {
        const rect = boxes[i];
        const pt1 = new cv.Point(rect.x, rect.y);
        const pt2 = new cv.Point(rect.x + rect.width, rect.y + rect.height);
        const rectColor = new cv.Vec(255, 0, 0);
        const rectThickness = 2;
        const rectLineType = cv.LINE_8;

        img.drawRectangle(pt1, pt2, rectColor, rectThickness, rectLineType);

        const text = `${labels[classIDs[i]]}: ${confidences[i]}`;
        const org = new cv.Point(rect.x, rect.y + 15);
        const fontFace = cv.FONT_HERSHEY_SIMPLEX;
        const fontScale = 0.5;
        const textColor = new cv.Vec(123, 123, 255);
        const thickness = 2;

        img.putText(text, org, fontFace, fontScale, textColor, thickness);

        console.log(
            `${text};`,
            `x: ${rect.x + rect.width / 2};`,
            `y: ${rect.y + rect.height / 2};`,
            `width: ${rect.width};`,
            `height: ${rect.height};`,
        );
    });

    const endTime = Date.now();
    const currentFps = (1 / (endTime - startTime)) * 1000;
    console.log(frameCounter++, currentFps);

    cv.imshow('Darknet YOLO Object Detection', img);
};

const grabFrames = (videoFile, delay, onFrame) => {
    const cap = new cv.VideoCapture(videoFile);
    cap.set(38, 1);
    cap.set(3, 256);
    cap.set(4, 192);
    let done = false;
    const intvl = setInterval(() => {
        cap.read();
        cap.read();
        let frame = cap.read();
        if (frame.empty) {
            cap.reset();
            frame = cap.read();
        }
        onFrame(frame);

        const key = cv.waitKey(delay);
        done = key !== -1 && key !== 255;
        if (done) {
            clearInterval(intvl);
            console.log('Key pressed, exiting.');
        }
    }, 0);
};

const runVideoDetection = (src, detect) => {
    grabFrames(src, 1, frame => {
        detect(frame);
    });
};

runVideoDetection(0, classifyImg);
