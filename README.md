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
| 2.01 | log-output reader fetches ping count over the network | ✅ built & tested |
| 2.02 | project split into frontend + backend (Service comms) | ✅ |
| 2.03 | move exercises apps into `exercises` namespace | ✅ |
| 2.04 | move project into `project` namespace | ✅ |
| 2.05 | Secret injected as env var | ✅ |
| 2.06 | ConfigMap injected into pods | ✅ |
| 2.07 | ping-pong counter in PostgreSQL StatefulSet | ✅ |
| 2.08 | project backend stores todos in PostgreSQL | ✅ |
| 2.09 | daily CronJob creates a todo | ✅ |
| 2.10 | labels/annotations for log aggregation | ✅ (labels on all manifests) |
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

## Deploy Part 2 (k3d)

```bash
DH=<DOCKERHUB_USER>
# build + import the v2 images
docker build -t $DH/log-output-writer:2.0 part-2/log-output/writer
docker build -t $DH/log-output-reader:2.0 part-2/log-output/reader
docker build -t $DH/ping-pong:2.0         part-2/ping-pong
docker build -t $DH/project-backend:2.0   part-2/project/backend
docker build -t $DH/project-frontend:2.0  part-2/project/frontend
for i in log-output-writer:2.0 log-output-reader:2.0 ping-pong:2.0 project-backend:2.0 project-frontend:2.0; do
  k3d image import $DH/$i -c devops
done
grep -rl '<DOCKERHUB_USER>' part-2 | xargs sed -i '' "s/<DOCKERHUB_USER>/$DH/g"

# namespaces
kubectl apply -f part-2/namespaces.yaml

# real secrets (copy the .example templates, set values — these files are gitignored)
cp part-2/postgres/postgres-secret.example.yaml part-2/postgres/postgres-secret.yaml
cp part-2/ping-pong/manifests/ping-pong-secret.example.yaml part-2/ping-pong/manifests/ping-pong-secret.yaml
# edit both, then:
kubectl apply -f part-2/postgres/postgres-secret.yaml -n exercises
kubectl apply -f part-2/postgres/postgres-secret.yaml -n project
kubectl apply -f part-2/ping-pong/manifests/ping-pong-secret.yaml -n exercises

# postgres into both namespaces
kubectl apply -f part-2/postgres/service.yaml -f part-2/postgres/statefulset.yaml -n exercises
kubectl apply -f part-2/postgres/service.yaml -f part-2/postgres/statefulset.yaml -n project

# apps
kubectl apply -f part-2/ping-pong/manifests/deployment.yaml -f part-2/ping-pong/manifests/service.yaml
kubectl apply -f part-2/log-output/manifests/
kubectl apply -f part-2/project/manifests/
kubectl apply -f part-2/cronjob/cronjob.yaml
```

## Prereqs
Docker, `kubectl`, `k3d`, a Docker Hub account. Parts 3+ additionally need a
Google Cloud account (GKE).
