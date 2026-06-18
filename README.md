# DevOps with Kubernetes 2026 — submission repo

Solutions for the University of Helsinki **DevOps with Kubernetes** course.

## Layout
```
part-1/  log-output (writer+reader), ping-pong, project — apps + Dockerfiles + manifests/
part-2/  namespaces, secrets, configmaps, postgres, frontend/backend split, cronjob
part-3/  GKE manifests, CI/CD (.github/workflows), resource limits, HPA, docs
part-4/  probes, Prometheus/Grafana, Argo Rollouts, messaging, ArgoCD (GitOps)
part-5/  CRD + controller, service mesh, serverless, comparison docs
```

## Exercise status

| Ex | What | Status |
|----|------|--------|
| 1.01 | log-output app (timestamp+uuid every 5s) | ✅ built & tested |
| 1.02 | project web server | ✅ |
| 1.03 | log-output deployment.yaml | ✅ |
| 1.04 | project deployment.yaml | ✅ |
| 1.05 | log-output Service + HTTP endpoint | ✅ |
| 1.06 | project Service | ✅ |
| 1.07 | log-output Ingress | ✅ |
| 1.08 | project Ingress | ✅ |
| 1.09 | ping-pong service (counter) | ✅ built & tested |
| 1.10 | log-output split writer/reader (shared volume) | ✅ |
| 1.11 | ping-pong counter persisted to PV | ✅ built & tested (survives restart) |
| 1.12 | project caches external image (24h) on PV | ✅ |
| 1.13 | project todo UI (form + list) on PV | ✅ built & tested |
| 2.01–2.10 | connect pods, frontend/backend split, namespaces, Secrets, ConfigMaps, Postgres StatefulSet, CronJob | ⬜ to build (local k3d) |
| 3.01–3.11 | GKE deploy, CI/CD, backups, resource limits, HPA, diagram | ☁️ needs your GKE/GCP; manifests+docs authorable |
| 4.01–4.08 | probes, Prometheus/Grafana, Argo Rollouts, NATS, ArgoCD GitOps | ☁️ needs live cluster |
| 5.01–5.08 | CRD+controller, service mesh, serverless, comparison docs | ☁️/📝 |

> **Honest note:** ✅ means the code/manifests are written and the app logic is
> verified locally. The course only marks an exercise complete once it's
> **deployed and running in your cluster** — that step is yours.

## Deploy Part 1 locally (k3d)

```bash
brew install k3d
k3d cluster create devops -p "8081:80@loadbalancer"   # maps localhost:8081 -> ingress

# host paths for the PersistentVolumes
docker exec k3d-devops-server-0 mkdir -p /tmp/kube /tmp/kube-project

DH=<DOCKERHUB_USER>   # your Docker Hub username
# build images
docker build -t $DH/log-output-writer:1.0 part-1/log-output/writer
docker build -t $DH/log-output-reader:1.0 part-1/log-output/reader
docker build -t $DH/ping-pong:1.0        part-1/ping-pong
docker build -t $DH/the-project:1.0      part-1/project
# import into k3d (no push needed)
for i in log-output-writer log-output-reader ping-pong the-project; do
  k3d image import $DH/$i:1.0 -c devops
done

# replace <DOCKERHUB_USER> in the manifests, then apply
grep -rl '<DOCKERHUB_USER>' part-1 | xargs sed -i '' "s/<DOCKERHUB_USER>/$DH/g"
kubectl apply -f part-1/ping-pong/manifests
kubectl apply -f part-1/log-output/manifests
kubectl apply -f part-1/project/manifests

kubectl get pods
curl localhost:8081/            # log-output: "<timestamp>: <uuid>"
curl localhost:8081/pingpong    # "pong N"
```

## Prereqs
Docker, `kubectl`, `k3d`, a Docker Hub account. Parts 3+ additionally need a
Google Cloud account (GKE).
