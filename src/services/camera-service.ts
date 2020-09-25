import { Mat } from 'opencv4nodejs';
import { Camera } from '../classes';
import { Config } from '../config';
import { LogService } from './log-service';

export class CameraService {
    private static instance: CameraService;
    private readonly LOG_TAG_NAME = 'CameraService';
    private readonly logService: LogService = LogService.getInstance();
    private readonly camera = new Camera(Config.CAMERA_DEVICE_PORT);

    constructor() {}

    public async grabFrame(): Promise<Mat> {
        return this.camera.grabFrame();
    }

    public static getInstance(): CameraService {
        if (!CameraService.instance) {
            CameraService.instance = new CameraService();
        }
        return CameraService.instance;
    }
}
