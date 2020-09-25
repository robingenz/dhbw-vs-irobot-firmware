import { DcEngine, Utils } from '../classes';
import { Config } from '../config';
import { HorizontalDirection, VerticalDirection } from '../enums';
import { LogService } from './log-service';

export class DcEngineService {
    private static instance: DcEngineService;
    private readonly LOG_TAG_NAME = 'DcEngineService';
    private readonly logService: LogService = LogService.getInstance();
    private readonly dcEngine1: DcEngine = new DcEngine(
        Config.DC_ENGINE_1_PWM_PIN,
        Config.DC_ENGINE_1_CONTROL_PIN_1,
        Config.DC_ENGINE_1_CONTROL_PIN_2,
    );
    private readonly dcEngine2: DcEngine = new DcEngine(
        Config.DC_ENGINE_2_PWM_PIN,
        Config.DC_ENGINE_2_CONTROL_PIN_1,
        Config.DC_ENGINE_2_CONTROL_PIN_2,
    );

    constructor() {}

    public startEngines(direction: HorizontalDirection): void {
        this.logService.info(this.LOG_TAG_NAME, 'Start engines', direction);
        this.dcEngine1.start(30, direction);
        this.dcEngine2.start(30, direction); // +4
    }

    public stopEngines(): void {
        this.logService.info(this.LOG_TAG_NAME, 'Stop engines');
        this.dcEngine1.stop();
        this.dcEngine2.stop();
    }

    public async rotate(degrees: number, direction: VerticalDirection): Promise<void> {
        this.logService.info(this.LOG_TAG_NAME, 'Start rotation', degrees, direction);
        const delay = degrees * 6.1;
        if (direction === VerticalDirection.Left) {
            this.dcEngine1.start(30, HorizontalDirection.Forward);
            this.dcEngine2.start(30, HorizontalDirection.Backward);
        } else {
            this.dcEngine1.start(30, HorizontalDirection.Backward);
            this.dcEngine2.start(30, HorizontalDirection.Forward);
        }
        await Utils.timeout(delay);
        this.dcEngine1.stop();
        this.dcEngine2.stop();
        this.logService.info(this.LOG_TAG_NAME, 'Stop rotation');
    }

    public reset(): void {
        this.dcEngine1.stop();
        this.dcEngine2.stop();
    }

    public static getInstance(): DcEngineService {
        if (!DcEngineService.instance) {
            DcEngineService.instance = new DcEngineService();
        }
        return DcEngineService.instance;
    }
}
