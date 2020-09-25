const Gpio = require('pigpio').Gpio;

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

const pin1 = new Gpio(4, { mode: Gpio.OUTPUT }); // 4
const pin2 = new Gpio(17, { mode: Gpio.OUTPUT }); // 17
const pin3 = new Gpio(27, { mode: Gpio.OUTPUT }); // 27
const pin4 = new Gpio(22, { mode: Gpio.OUTPUT }); // 22

function setStep(w1, w2, w3, w4) {
    pin1.digitalWrite(w1);
    pin2.digitalWrite(w2);
    pin3.digitalWrite(w3);
    pin4.digitalWrite(w4);
}

async function forward(delay, steps) {
    for (let i = 0; i < steps; i++) {
        for (const j in [...Array(stepCount).keys()]) {
            setStep(seq[j][0], seq[j][1], seq[j][2], seq[j][3]);
            await new Promise(r => setTimeout(r, delay));
        }
    }
}

async function backwards(delay, steps) {
    const seq2 = seq.reverse();
    for (let i = 0; i < steps; i++) {
        for (const j in [...Array(stepCount).keys()]) {
            setStep(seq2[j][0], seq2[j][1], seq2[j][2], seq2[j][3]);
            await new Promise(r => setTimeout(r, delay));
        }
    }
}

async function start() {
    const delay = 1; // ms
    const stepsForward = 128;
    await forward(delay / 1000.0, stepsForward);
    // const stepsBackward = 128;
    // await backwards(delay / 1000.0, stepsBackward)
}

start();
