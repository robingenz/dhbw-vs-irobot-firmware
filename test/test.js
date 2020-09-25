const Gpio = require('pigpio').Gpio;

async function testEngines() {
    console.log('Test engines...');
    await new Promise(r => setTimeout(r, 1000));
    const engine1_pinPwm = new Gpio(19, { mode: Gpio.OUTPUT });
    const engine1_pinIn1 = new Gpio(20, { mode: Gpio.OUTPUT });
    const engine1_pinIn2 = new Gpio(21, { mode: Gpio.OUTPUT });
    const engine2_pinPwm = new Gpio(18, { mode: Gpio.OUTPUT });
    const engine2_pinIn1 = new Gpio(23, { mode: Gpio.OUTPUT });
    const engine2_pinIn2 = new Gpio(24, { mode: Gpio.OUTPUT });

    const RUNNING_TIME = 10; // seconds
    const PWM_FREQUENCY = 50000; // Hz
    const PWM_DUTY_CYCLE = 30; // percent

    engine1_pinIn1.digitalWrite(0);
    engine1_pinIn2.digitalWrite(1);
    engine2_pinIn1.digitalWrite(0);
    engine2_pinIn2.digitalWrite(1);

    const duty = PWM_DUTY_CYCLE * 10000; // Max: 1M
    engine1_pinPwm.hardwarePwmWrite(PWM_FREQUENCY, duty);
    engine2_pinPwm.hardwarePwmWrite(PWM_FREQUENCY, duty);
    console.log(`Running for ${RUNNING_TIME} seconds`);

    await new Promise(r => setTimeout(r, RUNNING_TIME * 1000));
    engine1_pinPwm.digitalWrite(0);
    engine2_pinPwm.digitalWrite(0);
}

async function testLineSensors() {
    console.log('Test line sensors...');
    await new Promise(r => setTimeout(r, 1000));
    const lineSensor1 = new Gpio(16, { mode: Gpio.INPUT, alert: true });
    const lineSensor2 = new Gpio(26, { mode: Gpio.INPUT, alert: true });

    lineSensor1.on('alert', (level, tick) => {
        console.log('lineSensor1', level, tick);
    });
    lineSensor2.on('alert', (level, tick) => {
        console.log('lineSensor2', level, tick);
    });

    const DELAY = 10; // seconds
    await new Promise(r => setTimeout(r, DELAY * 1000));
}

async function testStepperEngine() {
    console.log('Test stepper engines...');
    await new Promise(r => setTimeout(r, 1000));
    const stepCount = 8;
    const seq = [
        [0, 1, 0, 0],
        [0, 1, 0, 1],
        [0, 0, 0, 1],
        [1, 0, 0, 1],
        [1, 0, 0, 0],
        [1, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 1, 1, 0],
    ];

    const pin1 = new Gpio(4, { mode: Gpio.OUTPUT });
    const pin2 = new Gpio(17, { mode: Gpio.OUTPUT });
    const pin3 = new Gpio(27, { mode: Gpio.OUTPUT });
    const pin4 = new Gpio(22, { mode: Gpio.OUTPUT });

    const setStep = (w1, w2, w3, w4) => {
        pin1.digitalWrite(w1);
        pin2.digitalWrite(w2);
        pin3.digitalWrite(w3);
        pin4.digitalWrite(w4);
    };

    const forward = async (delay, steps) => {
        for (let i = 0; i < steps; i++) {
            for (const j in [...Array(stepCount).keys()]) {
                setStep(seq[j][0], seq[j][1], seq[j][2], seq[j][3]);
                await new Promise(r => setTimeout(r, delay));
            }
        }
    };

    const backwards = async (delay, steps) => {
        for (let i = 0; i < steps; i++) {
            for (const j in [...Array(stepCount).keys()].reverse()) {
                setStep(seq[j][0], seq[j][1], seq[j][2], seq[j][3]);
                await new Promise(r => setTimeout(r, delay));
            }
        }
    };

    const delay = 2; // ms
    const stepsForward = 130;
    await forward(delay / 1000.0, stepsForward);
    const stepsBackward = 130;
    await backwards(delay / 1000.0, stepsBackward);
}

async function run() {
    await testEngines();
    await testLineSensors();
    // await testStepperEngine();
}

run();
