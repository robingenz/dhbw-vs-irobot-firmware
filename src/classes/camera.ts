import { CAP_PROP_BUFFERSIZE, CAP_PROP_FRAME_HEIGHT, CAP_PROP_FRAME_WIDTH, Mat, VideoCapture } from 'opencv4nodejs';
import { Config } from '../config';

export class Camera {
    private cap: VideoCapture;

    constructor(devicePort: number) {
        this.cap = new VideoCapture(devicePort);
        this.cap.set(CAP_PROP_BUFFERSIZE, Config.CAMERA_BUFFER_SIZE);
        this.cap.set(CAP_PROP_FRAME_WIDTH, Config.CAMERA_FRAME_WIDTH);
        this.cap.set(CAP_PROP_FRAME_HEIGHT, Config.CAMERA_FRAME_HEIGHT);
    }

    public async grabFrame(): Promise<Mat> {
        await this.cap.readAsync(); // clear the buffer
        await this.cap.readAsync();
        return this.cap.readAsync();
    }
}
