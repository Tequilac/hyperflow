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

async function kNativeCommand(ins, outs, context, cb) {

    function createData() {
        const dataString = `
        - name: {key}
          value: "{value}"`;
        let amountParams = {
            key: "DATA_NUM",
            value: ins.dataUrl.data[0].length
        }
        console.log(ins);
        let result = interpolate(dataString, amountParams);
        for (let i = 0; i < ins.dataUrl.data[0].length; i++) {
            let dataParams = {
                key: `DATA${i}`,
                value: ins.dataUrl.data[0][i]
            }
            result += interpolate(dataString, dataParams);
        }
        return result;
    }

    async function execute(spec, client, url) {
        const response = await fetch(url);
        const json = await response.json();
        console.log(json);
        await deleteService(spec, client);
        return json;
    }

    async function getCondition(spec, client, name, url) {
        response = await client.read({
            apiVersion: "apps/v1",
            kind: "Deployment",
            metadata: {
                name: `${name}-deployment`
            }
        });
        const condition = response.body.status.conditions[0].type;
        console.log(`Current condition: ${condition}`);
        if (condition !== "Available") {
            setTimeout(() => getCondition(spec, client, name, url), 1000);
        } else {
            outs[0].data = await execute(spec, client, url);
            cb(null, outs);
        }
    }

    async function deleteService(spec, client) {
        console.log("Deleting...");
        await client.delete(spec);
        console.log("Service deleted");
    }

    async function scheduleExecution(spec, client) {
        let response = await client.read(spec);
        const url = response.body.status.url;
        console.log("Obtained service url: " + url);
        setTimeout(() => getCondition(spec, client, response.body.status.latestCreatedRevisionName, url), 1000);
    }

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
    setTimeout(() => scheduleExecution(spec, client, outs, cb), 3000);
}

exports.kNativeCommand = kNativeCommand;
