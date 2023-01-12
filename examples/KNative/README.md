# Knative example

This example demonstrates using the hyperflow engine to deploy and invoke Knative function workflows.

## Prerequisites

- [**kind**](https://kind.sigs.k8s.io/docs/user/quick-start) or [**minikube**](https://minikube.sigs.k8s.io/docs/start/)
to run a local Kubernetes cluster
- [**kubectl**](https://kubernetes.io/docs/tasks/tools/) - a Kubernetes CLI
- [**kn**](https://kubernetes.io/docs/tasks/tools/) - a Knative CLI
- [**kn func**](https://knative.dev/docs/functions/install-func/#installing-knative-functions) -
a Knative function plugin.
Notice that the install page recommends either the **func** or **kn func** plugin,
but these are just two options on how to name the exact same binary.

After installing those tools install [**kn quickstart**](https://kubernetes.io/docs/tasks/tools/) - a Knative quickstart
plugin and run one of the below commands depending on the used K8s distribution:
```
kn quickstart minikube
```
```
kn quickstart kind
```
Next follow the steps recommended by the command's output.

## After the cluster setup

Once the cluster is set up login to the docker container registry you will be using.

E.g. when using an AWS ECR use command:
```
aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <aws_account_id>.dkr.ecr.<region>.amazonaws.com
```

If you are using a private repository then create a Kubernetes secret using the registry credentials:
```
kubectl create secret docker-registry <registry-credential-secrets> \
  --docker-server=<private-registry-url> \
  --docker-username=<private-registry-user> \
  --docker-password=<private-registry-password>
```
Then add the imagePullSecrets object to the default service account in the default namespace:
```
kubectl patch serviceaccount default -p "{\"imagePullSecrets\": [{\"name\": \"container-registry\"}]}"
```

## Preparing a function

In order to create a function use the command:
```
(kn) func create -l <function-language> <name>
```

TODO describe config

Once this is done you can run the hyperflow server and submit the job to build, deploy and invoke the function.
After the function is invoked for all the provided data it will be deleted unless specified otherwise in the config.
