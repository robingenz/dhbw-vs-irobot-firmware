import { combineLatest, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { LineSensor } from '../classes/line-sensor';
import { Config } from '../config';
import { LogService } from './log-service';

export class LineSensorService {
    private static instance: LineSensorService;
    private readonly LOG_TAG_NAME = 'LineSensorService';
    private readonly logService: LogService = LogService.getInstance();
    private readonly lineSensor1: LineSensor = new LineSensor(Config.LINE_SENSOR_1_PIN);
    private readonly lineSensor2: LineSensor = new LineSensor(Config.LINE_SENSOR_2_PIN);

    constructor() {}

    public get onDetection$(): Observable<void> {
        return combineLatest([this.lineSensor1.onChange$, this.lineSensor2.onChange$]).pipe(
            filter(([onChange1, onChange2]) => onChange1 === 0 && onChange2 === 0),
            map(val => {}),
        );
    }

    public get onDetectionLeft$(): Observable<void> {
        return this.lineSensor2.onChange$.pipe(
            filter(onChange => onChange === 0),
            map(val => {}),
        );
    }

    public get onDetectionRight$(): Observable<void> {
        return this.lineSensor1.onChange$.pipe(
            filter(onChange => onChange === 0),
            map(val => {}),
        );
    }

    public static getInstance(): LineSensorService {
        if (!LineSensorService.instance) {
            LineSensorService.instance = new LineSensorService();
        }
        return LineSensorService.instance;
    }
}
