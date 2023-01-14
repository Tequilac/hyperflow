// Runs a service in a KNative cluster

const k8s = require('@kubernetes/client-node');


async function kNativeCommand(ins, outs, context, cb) {
    console.log(ins);
    console.log(outs);
    console.log(context);
    console.log(cb);
    const kubeconfig = new k8s.KubeConfig();
    kubeconfig.loadFromDefault();
    console.log(kubeconfig);
    // console.log(`Deploying function ${context.name}`);
    // exec(`func deploy --path ${context.path} --repository ${context.repository}`, (err, stdout, stderr) => {
    //     if (err) {
    //         console.log(`Error while deploying function ${context.name}: ${stderr}`);
    //     } else {
    //         console.log(stdout);
    //         kNativeInvokeFunction(context, ins);
    //     }
    // });
}

exports.kNativeCommand = kNativeCommand;
