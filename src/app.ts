import { combineLatest, merge, Subject } from 'rxjs';
import { delay, filter, take, takeUntil } from 'rxjs/operators';
import { Utils } from './classes';
import { HorizontalDirection, VerticalDirection } from './enums';
import { DcEngineService, HttpService, LineSensorService, LogService, ObjectDetectionService } from './services';

export class App {
    private static instance: App;
    private readonly LOG_TAG_NAME = 'App';
    private readonly httpService: HttpService = HttpService.getInstance();
    private readonly objectDetectionService: ObjectDetectionService = ObjectDetectionService.getInstance();
    private readonly dcEngineService: DcEngineService = DcEngineService.getInstance();
    private readonly lineSensorService: LineSensorService = LineSensorService.getInstance();
    private readonly logService: LogService = LogService.getInstance();

    private readonly resetSubj: Subject<void> = new Subject();

    constructor() {}

    public async init(): Promise<void> {
        this.logService.info(this.LOG_TAG_NAME, 'Initialization started');
        await this.objectDetectionService.init();
        this.httpService.init();
        this.httpService.onRequest$.subscribe(request => {
            if (request.action === 'start') {
                this.start(request.param || '');
            } else {
                this.reset();
            }
        });
        this.logService.info(this.LOG_TAG_NAME, 'Initialization finished');
    }

    public async start(label: string): Promise<void> {
        if (!label) {
            throw new Error('No target selected!');
        }

        const onDetectionForLabel$ = this.objectDetectionService.onDetectionForLabel$(label);
        const onMidObjectDetection$ = onDetectionForLabel$.pipe(filter(d => d.coords.x <= 141 && d.coords.x >= 115 && d.size.width < 70));
        const onSideObjectDetection$ = onDetectionForLabel$.pipe(filter(d => d.coords.x > 146 || (d.coords.x < 110 && d.size.width < 70)));
        const onLineDetections$ = combineLatest([this.lineSensorService.onDetectionLeft$, this.lineSensorService.onDetectionRight$]);
        const takeUntil$ = merge(this.resetSubj, onLineDetections$);

        onLineDetections$.pipe(take(1), takeUntil(this.resetSubj)).subscribe(async () => {
            this.logService.info(this.LOG_TAG_NAME, 'Line detected (left and right)');
            await Utils.timeout(500);
            this.dcEngineService.stopEngines();
            this.dcEngineService.startEngines(HorizontalDirection.Backward);
            await Utils.timeout(1500); // TODO: 40 cm zurück
            this.reset();
        });
        onMidObjectDetection$.pipe(takeUntil(takeUntil$)).subscribe(detection => {
            this.logService.info(this.LOG_TAG_NAME, 'Object detected (middle)', detection);
            this.dcEngineService.startEngines(HorizontalDirection.Forward);
        });
        onSideObjectDetection$.pipe(takeUntil(takeUntil$)).subscribe(async detection => {
            this.logService.info(this.LOG_TAG_NAME, 'Object detected (side)', detection);
            this.objectDetectionService.stopDetection();
            this.dcEngineService.stopEngines();
            const diff = Math.abs(detection.coords.x - 128);
            const degree = Math.round(diff / 3);
            if (detection.coords.x > 128) {
                await this.dcEngineService.rotate(degree, VerticalDirection.Right);
            } else {
                await this.dcEngineService.rotate(degree, VerticalDirection.Left);
            }
            this.objectDetectionService.startDetection();
        });
        merge(onSideObjectDetection$, onMidObjectDetection$)
            .pipe(delay(4000), takeUntil(takeUntil$))
            .subscribe(() => {
                this.logService.info(this.LOG_TAG_NAME, 'Object lost');
                this.dcEngineService.startEngines(HorizontalDirection.Forward);
            });

        this.objectDetectionService.startDetection();
        await Utils.timeout(500);
        this.dcEngineService.startEngines(HorizontalDirection.Forward);
    }

    public async reset(): Promise<void> {
        this.logService.info(this.LOG_TAG_NAME, 'Reset');
        this.resetSubj.next(undefined);
        this.objectDetectionService.stopDetection();
        this.dcEngineService.reset();
    }

    public static getInstance(): App {
        if (!App.instance) {
            App.instance = new App();
        }
        return App.instance;
    }
}

const appInstance = App.getInstance();
appInstance.init();
