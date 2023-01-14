// Runs a service in a KNative cluster

const k8s = require('@kubernetes/client-node');
const yaml = require('js-yaml');

SERVICE_YAML_TEMPLATE = `
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: {name}
  namespace: {namespace}
spec:
  template:
    spec:
      containers:
        - image: docker.io/{image}
          env:
          {dataParams}`;


var interpolate = (tpl, args) => tpl.replace(/{(\w+)}/g, (_, v) => args[v]);


function createData(ins) {
    const dataString = `
          - name: {key}
          value: {value}`;
    amountParams = {
        key: "DATA_NUM",
        value: ins.dataUrl.data[0].length
    }
    let result = interpolate(dataString, amountParams);
    for (let i = 0; i < ins.dataUrl.data[0].length; i++) {
        params = {
            key: `DATA${i}`,
            value: ins.dataUrl.data[0][i]
        }
        result += ("\n" + interpolate(dataString, params));
    }
    return result;
}

async function kNativeCommand(ins, outs, context, cb) {
    console.log(ins);
    console.log(outs);
    console.log(context);
    console.log(cb);
    const kubeconfig = new k8s.KubeConfig();
    kubeconfig.loadFromDefault();


    const params = {
        name: context.name,
        namespace: context.namespace ? context.namespace : "default",
        image: context.image,
        dataParams: createData(ins)
    }
    console.log(interpolate(SERVICE_YAML_TEMPLATE, params));

    var specs = yaml.safeLoad(interpolate(SERVICE_YAML_TEMPLATE, params));

    console.log(specs);
    const client = k8s.KubernetesObjectApi.makeApiClient(kubeconfig);
    const validSpecs = specs.filter((s) => s && s.kind && s.metadata);
    console.log(k8sApi);

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
