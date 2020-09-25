export class Config {
    static readonly PORT: number = 8080;
    static readonly DC_ENGINE_1_PWM_PIN: number = 19;
    static readonly DC_ENGINE_1_CONTROL_PIN_1: number = 26;
    static readonly DC_ENGINE_1_CONTROL_PIN_2: number = 21;
    static readonly DC_ENGINE_2_PWM_PIN: number = 18;
    static readonly DC_ENGINE_2_CONTROL_PIN_1: number = 23;
    static readonly DC_ENGINE_2_CONTROL_PIN_2: number = 24;
    static readonly LINE_SENSOR_1_PIN: number = 11;
    static readonly LINE_SENSOR_2_PIN: number = 4;
    static readonly CAMERA_DEVICE_PORT: number = 0;
    static readonly CAMERA_BUFFER_SIZE: number = 1;
    static readonly CAMERA_FRAME_WIDTH: number = 256;
    static readonly CAMERA_FRAME_HEIGHT: number = 192;
    static readonly OD_SCORE_THRESHOLD: number = 0.5;
    static readonly OD_NMS_THRESHOLD: number = 0.4;
    static readonly OD_CFG_PATH: string[] = ['assets', 'networks', '256x192-9', 'yolo-tiny-obj.cfg'];
    static readonly OD_WEIGHTS_PATH: string[] = ['assets', 'networks', '256x192-9', 'yolo-tiny-obj_15000.weights'];
    static readonly OD_LABELS_PATH: string[] = ['assets', 'networks', '256x192-9', 'obj.names'];
}
