import { Gpio } from 'pigpio';
import { Observable, Subject } from 'rxjs';

export class LineSensor {
    private readonly gpio: Gpio;
    private readonly onChangeSubj: Subject<number> = new Subject();

    constructor(pin: number) {
        this.gpio = new Gpio(pin, { mode: Gpio.INPUT, alert: true });
        this.addEventListener();
    }

    private addEventListener(): void {
        this.gpio.addListener('alert', (level, tick) => {
            this.onChangeSubj.next(level);
        });
    }

    public get onChange$(): Observable<number> {
        return this.onChangeSubj.asObservable();
    }
}
