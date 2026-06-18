# Install-only exercises (run these on your cluster — local k3d is fine)

These exercises are "done" by installing the tool and wiring up your apps; the
manifests/configs above support them. Exact commands:

## 4.03 — Prometheus + Grafana
```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
kubectl create namespace prometheus
helm install kube-prom prometheus-community/kube-prometheus-stack -n prometheus
# Grafana: kubectl -n prometheus port-forward svc/kube-prom-grafana 3000:80
```

## 5.02 — Service mesh (Linkerd, mTLS)
```bash
curl -sL https://run.linkerd.io/install | sh
linkerd install --crds | kubectl apply -f -
linkerd install | kubectl apply -f -
kubectl get deploy -n project -o yaml | linkerd inject - | kubectl apply -f -
linkerd viz install | kubectl apply -f -   # then: linkerd viz dashboard
# verify mTLS: linkerd viz edges deploy -n project
```

## 5.06 / 5.07 — Serverless (Knative) scale-to-zero
```bash
kubectl apply -f https://github.com/knative/serving/releases/latest/download/serving-crds.yaml
kubectl apply -f https://github.com/knative/serving/releases/latest/download/serving-core.yaml
# deploy ping-pong as a Knative Service -> idles to 0 replicas, wakes on request
kubectl apply -f - <<'EOF'
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: ping-pong
spec:
  template:
    spec:
      containers:
        - image: <DOCKERHUB_USER>/ping-pong:2.0
EOF
```
