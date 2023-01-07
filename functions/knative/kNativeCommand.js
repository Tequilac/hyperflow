// Runs a function in a KNative cluster

const {exec} = require('child_process');


async function kNativeInvokeFunction(context, ins) {
    console.log(`Invoking function ${context.name}`);
    exec(`func invoke --data ${ins[0]}`, (err, stdout, stderr) => {
        if (err) {
            console.log(`Error while invoking function ${context.name}: ${stderr}`);
        } else {
            console.log(stdout);
        }
    });
}


async function kNativeCommand(ins, outs, context, cb) {
    console.log(`Deploying function ${context.name}`);
    exec(`func deploy --path ${context.path} --repository ${context.repository}`, (err, stdout, stderr) => {
        if (err) {
            console.log(`Error while deploying function ${context.name}: ${stderr}`);
        } else {
            console.log(stdout);
            kNativeInvokeFunction(context, ins);
        }
    });
}

exports.kNativeCommand = kNativeCommand;
