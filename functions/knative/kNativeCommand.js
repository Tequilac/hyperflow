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
        env:{dataParams}`;


var interpolate = (tpl, args) => tpl.replace(/{(\w+)}/g, (_, v) => args[v]);


function createData(ins) {
    const dataString = `
        - name: {key}
          value: "{value}"`;
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
        result += interpolate(dataString, params);
    }
    return result;
}

async function getCondition(client, name) {
    response = await client.read({
        apiVersion: "apps/v1",
        kind: "Deployment",
        metadata: {
            name: `${name}-deployment`
        }
    });
    console.log(response.body.status.conditions);
    setTimeout(() => getCondition(client, name), 1000);
}

async function deleteService(spec, client) {

    console.log("Deleting...");
    await client.delete(spec);
    console.log("Service deleted");
}

async function getAddress(spec, client) {
    let response = await client.read(spec);
    const url = response.body.status.url;
    console.log("Obtained service url: " + url);
    setTimeout(() => getCondition(client, response.body.status.latestCreatedRevisionName), 1000);
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

    var spec = yaml.safeLoad(interpolate(SERVICE_YAML_TEMPLATE, params));

    console.log(spec);
    const client = k8s.KubernetesObjectApi.makeApiClient(kubeconfig);
    let response = await client.create(spec);
    console.log(response.body);
    setTimeout(() => getAddress(spec, client), 3000);
}

exports.kNativeCommand = kNativeCommand;
