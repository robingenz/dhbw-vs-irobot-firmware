const Gpio = require('pigpio').Gpio;

const engine1_pinPwm = new Gpio(19, { mode: Gpio.OUTPUT });
const engine1_pinIn1 = new Gpio(26, { mode: Gpio.OUTPUT });
const engine1_pinIn2 = new Gpio(21, { mode: Gpio.OUTPUT });
const engine2_pinPwm = new Gpio(18, { mode: Gpio.OUTPUT });
const engine2_pinIn1 = new Gpio(23, { mode: Gpio.OUTPUT });
const engine2_pinIn2 = new Gpio(24, { mode: Gpio.OUTPUT });

const RUNNING_TIME = 5; // seconds
const PWM_FREQUENCY = 50000; // Hz
const PWM_DUTY_CYCLE = 30; // percent

const lineSensor1 = new Gpio(11, { mode: Gpio.INPUT, alert: true });
const lineSensor2 = new Gpio(4, { mode: Gpio.INPUT, alert: true });

lineSensor1.on('alert', (level, tick) => {
    console.log(`[${Date.now()}] [lineSensor1]`, level, tick);
});

lineSensor2.on('alert', (level, tick) => {
    console.log(`[${Date.now()}] [lineSensor2]`, level, tick);
});

async function run() {
    engine1_pinIn1.digitalWrite(0);
    engine1_pinIn2.digitalWrite(1);
    engine2_pinIn1.digitalWrite(0);
    engine2_pinIn2.digitalWrite(1);
    // engine1_pinIn1.digitalWrite(1);
    // engine1_pinIn2.digitalWrite(0);
    // engine2_pinIn1.digitalWrite(1);
    // engine2_pinIn2.digitalWrite(0);

    const duty = PWM_DUTY_CYCLE * 10000; // Max: 1M
    const duty1 = 30 * 10000; // Max: 1M
    const duty2 = 30 * 10000; // Max: 1M
    engine1_pinPwm.hardwarePwmWrite(PWM_FREQUENCY, duty1);
    engine2_pinPwm.hardwarePwmWrite(PWM_FREQUENCY, duty2);
    console.log(`Running for ${RUNNING_TIME} seconds`);

    await new Promise(r => setTimeout(r, RUNNING_TIME * 1000));

    engine1_pinPwm.digitalWrite(0);
    engine2_pinPwm.digitalWrite(0);

    console.log(`Stopped`);
}

run();
