import express from 'express';
import path from 'path';
import { Observable, Subject } from 'rxjs';
import { Config } from '../config';
import { LogService } from './log-service';

export interface HttpRequest {
    action: 'start' | 'stop';
    param?: string;
}

export class HttpService {
    private static instance: HttpService;
    private readonly LOG_TAG_NAME = 'ObjectDetectionService';
    private readonly logService: LogService = LogService.getInstance();
    private readonly server = express();
    private readonly onRequestSubject: Subject<HttpRequest> = new Subject();

    constructor() {}

    public init(): void {
        this.server.use(express.static(path.resolve(process.cwd(), 'public')));
        this.server.get('/start', (req, res) => {
            this.onRequestSubject.next({ action: 'start', param: req.query.target as string });
            res.redirect('/');
        });
        this.server.get('/stop', (req, res) => {
            this.onRequestSubject.next({ action: 'stop' });
            res.redirect('/');
        });
        this.server.listen(Config.PORT, () => this.logService.info(this.LOG_TAG_NAME, `Listening on port ${Config.PORT}!`));
    }

    public get onRequest$(): Observable<HttpRequest> {
        return this.onRequestSubject.asObservable();
    }

    public static getInstance(): HttpService {
        if (!HttpService.instance) {
            HttpService.instance = new HttpService();
        }
        return HttpService.instance;
    }
}
