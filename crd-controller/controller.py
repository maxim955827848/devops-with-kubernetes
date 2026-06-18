# ex 5.01 — a kopf controller that watches DummySite resources and, for each one,
# provisions an nginx Deployment + Service that serves a copied snapshot of the
# website given in spec.website_url. Child objects are adopted, so deleting the
# DummySite garbage-collects them.
import kopf
import kubernetes.client as k8s


def _manifests(name, url):
    labels = {"app": f"dummysite-{name}"}
    deployment = {
        "apiVersion": "apps/v1",
        "kind": "Deployment",
        "metadata": {"name": f"dummysite-{name}", "labels": labels},
        "spec": {
            "replicas": 1,
            "selector": {"matchLabels": labels},
            "template": {
                "metadata": {"labels": labels},
                "spec": {
                    "volumes": [{"name": "site", "emptyDir": {}}],
                    "initContainers": [{
                        "name": "fetch",
                        "image": "alpine:3.19",
                        "command": ["sh", "-c",
                                    f"apk add --no-cache wget && "
                                    f"wget -e robots=off -E -H -k -p -P /site {url} || true; "
                                    f"cp -r /site/* /usr/share/nginx/html/ 2>/dev/null || true"],
                        "volumeMounts": [{"name": "site", "mountPath": "/usr/share/nginx/html"}],
                    }],
                    "containers": [{
                        "name": "nginx",
                        "image": "nginx:alpine",
                        "ports": [{"containerPort": 80}],
                        "volumeMounts": [{"name": "site", "mountPath": "/usr/share/nginx/html"}],
                    }],
                },
            },
        },
    }
    service = {
        "apiVersion": "v1",
        "kind": "Service",
        "metadata": {"name": f"dummysite-{name}"},
        "spec": {"selector": labels, "ports": [{"port": 80, "targetPort": 80}]},
    }
    return deployment, service


@kopf.on.create("dwk.io", "v1", "dummysites")
def create_fn(spec, name, namespace, logger, **kwargs):
    url = spec.get("website_url")
    if not url:
        raise kopf.PermanentError("spec.website_url is required")

    deployment, service = _manifests(name, url)
    kopf.adopt(deployment)   # owner reference -> cascade delete
    kopf.adopt(service)

    k8s.AppsV1Api().create_namespaced_deployment(namespace, deployment)
    k8s.CoreV1Api().create_namespaced_service(namespace, service)
    logger.info(f"provisioned DummySite '{name}' serving {url}")
    return {"provisioned": True}
