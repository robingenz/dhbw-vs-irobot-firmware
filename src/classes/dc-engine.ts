import { Gpio } from 'pigpio';
import { HorizontalDirection } from '../enums';

export class DcEngine {
    private readonly PWM_FREQUENCY = 50000;
    private pwmGpio: Gpio;
    private controlGpio1: Gpio;
    private controlGpio2: Gpio;

    constructor(pwmPin: number, controlPin1: number, controlPin2: number) {
        this.pwmGpio = new Gpio(pwmPin, { mode: Gpio.OUTPUT });
        this.controlGpio1 = new Gpio(controlPin1, { mode: Gpio.OUTPUT });
        this.controlGpio2 = new Gpio(controlPin2, { mode: Gpio.OUTPUT });
    }

    /**
     * Starts the engine
     * @param speed value between 0 and 100
     * @param direction
     */
    public start(speed: number, direction: HorizontalDirection): void {
        if (direction === HorizontalDirection.Forward) {
            this.controlGpio1.digitalWrite(0);
            this.controlGpio2.digitalWrite(1);
        } else {
            this.controlGpio1.digitalWrite(1);
            this.controlGpio2.digitalWrite(0);
        }
        const duty = speed * 10000; // Max: 1M
        this.pwmGpio.hardwarePwmWrite(this.PWM_FREQUENCY, duty);
    }

    public stop(): void {
        this.pwmGpio.digitalWrite(0);
    }
}
