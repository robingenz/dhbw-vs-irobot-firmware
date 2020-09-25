import * as _ from 'lodash';
import * as path from 'path';
import { Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { ObjectDetection, ObjectDetector } from '../classes';
import { Config } from '../config';
import { CameraService } from './camera-service';
import { LogService } from './log-service';

export class ObjectDetectionService {
    private static instance: ObjectDetectionService;
    private readonly LOG_TAG_NAME = 'ObjectDetectionService';
    private readonly logService: LogService = LogService.getInstance();
    private readonly cameraService: CameraService = CameraService.getInstance();
    private readonly objectDetector = new ObjectDetector();
    private readonly onDetectionsSubj: Subject<ObjectDetection[]> = new Subject();
    private isActive = false;

    constructor() {}

    public async init(): Promise<void> {
        this.logService.info(this.LOG_TAG_NAME, 'Initialization');
        const cfgPath: string = path.resolve(process.cwd(), ...Config.OD_CFG_PATH);
        const weightsPath: string = path.resolve(process.cwd(), ...Config.OD_WEIGHTS_PATH);
        const labelsPath: string = path.resolve(process.cwd(), ...Config.OD_LABELS_PATH);
        await this.objectDetector.init(cfgPath, weightsPath, labelsPath);
    }

    public startDetection(): void {
        this.logService.info(this.LOG_TAG_NAME, 'Start detection');
        if (this.isActive) {
            return;
        }
        this.isActive = true;
        this.run();
    }

    public stopDetection(): void {
        this.logService.info(this.LOG_TAG_NAME, 'Stop detection');
        this.isActive = false;
    }

    public async run(): Promise<void> {
        while (this.isActive) {
            const frame = await this.cameraService.grabFrame();
            if (!this.isActive) {
                break;
            }
            const detections = await this.objectDetector.detectObjectsOnFrame(frame);
            if (!this.isActive) {
                break;
            }
            this.onDetectionsSubj.next(detections);
        }
    }

    public get onDetections$(): Observable<ObjectDetection[]> {
        return this.onDetectionsSubj.asObservable();
    }

    public onDetectionForLabel$(label: string): Observable<ObjectDetection> {
        return this.onDetections$.pipe(
            map(detections => _.find(detections, detection => detection.label === label)),
            filter(detection => detection !== undefined),
        ) as Observable<ObjectDetection>;
    }

    public static getInstance(): ObjectDetectionService {
        if (!ObjectDetectionService.instance) {
            ObjectDetectionService.instance = new ObjectDetectionService();
        }
        return ObjectDetectionService.instance;
    }
}
