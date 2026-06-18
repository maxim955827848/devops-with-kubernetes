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
| 3.01 | deploy ping-pong/log-output to GKE | ☁️ deploy (reuse Part 2 manifests) |
| 3.02 | cloud Ingress on GKE | ☁️ deploy (Part 2 ingress) |
| 3.03 | CI/CD pipeline | ✅ `.github/workflows/deploy.yaml` (needs your GKE secrets) |
| 3.04 | PR preview environments | ✅ `.github/workflows/preview-env.yaml` |
| 3.05 | tear down preview on PR close | ✅ (same workflow) |
| 3.06 | DBaaS vs DIY essay | ✅ `part-3/DBaaS_vs_DIY.md` |
| 3.07 | DB backup CronJob to GCS | ✅ `part-3/backup-cronjob.yaml` |
| 3.08/3.09 | resource requests & limits | ✅ set on every container (part-2 manifests + `part-3/resources-and-hpa.yaml`) |
| 3.10 | HorizontalPodAutoscaler | ✅ `part-3/resources-and-hpa.yaml` (backend has CPU requests) |
| 3.11 | architecture diagram | ✅ `part-3/architecture.md` (Mermaid) |
| 4.01/4.02 | readiness/liveness probes | ✅ `part-4/probes/probes.md` |
| 4.03 | Prometheus + Grafana | 🛠️ install (`part-5/docs/install-notes.md`) |
| 4.04/4.05 | Argo Rollouts canary + Prometheus analysis | ✅ `part-4/argo-rollouts/` (backend exposes `/metrics` via prom-client) |
| 4.06 | NATS broker + publisher/consumer | ✅ broker `part-4/messaging/`, publisher in `backend/index.js`, consumer `broadcaster/` |
| 4.07/4.08 | ArgoCD GitOps + image-update loop | ✅ `part-4/argocd/` (Application + Image Updater annotations) |
| 5.01 | CRD `DummySite` + kopf controller | ✅ `part-5/crd-controller/` |
| 5.02 | service mesh (Linkerd, mTLS) | 🛠️ install (`part-5/docs/install-notes.md`) |
| 5.03 | external-material reflection | ✅ `part-5/docs/reflection.md` |
| 5.04 | initContainer + sidecar Wikipedia pod | ✅ `part-5/wikipedia/pod.yaml` |
| 5.05 | platform comparison essay | ✅ `part-5/docs/Platform_Comparison.md` |
| 5.06/5.07 | serverless (Knative scale-to-zero) | 🛠️ install (`part-5/docs/install-notes.md`) |
| 5.08 | CNCF landscape writeup | ✅ `part-5/docs/landscape.md` |

Legend: ✅ files written (deploy to count) · 🛠️ run the install commands provided · ☁️ needs GKE.

> **Honest note:** ✅ means the code/manifests are written and the app logic is
> verified locally. The course only marks an exercise complete once it's
> **deployed and running in your cluster** — that step is yours.

## Container registry

All images use the GitHub Container Registry namespace `ghcr.io/maxim955827848`
(the manifests reference concrete image names — no placeholders to substitute).
For local k3d you build with that name and `k3d image import` it; nothing is
pushed. For GKE/ArgoCD, push to GHCR and either make the packages public or add
an `imagePullSecret` (see below).

```bash
REG=ghcr.io/maxim955827848

# push images to GHCR (GKE / ArgoCD path)
echo "$GHCR_TOKEN" | docker login ghcr.io -u maxim955827848 --password-stdin
docker push $REG/<image>:<tag>

# pull secret, only if the GHCR packages are private
kubectl create secret docker-registry ghcr \
  --docker-server=ghcr.io --docker-username=maxim955827848 \
  --docker-password="$GHCR_TOKEN" -n <namespace>
# then add `imagePullSecrets: [{name: ghcr}]` to the pod spec (or the namespace's default SA)
```

## Deploy Part 1 locally (k3d)

```bash
brew install k3d
k3d cluster create devops -p "8081:80@loadbalancer"   # maps localhost:8081 -> ingress

# host paths for the PersistentVolumes
docker exec k3d-devops-server-0 mkdir -p /tmp/kube /tmp/kube-project

REG=ghcr.io/maxim955827848
# build images
docker build -t $REG/log-output-writer:1.0 part-1/log-output/writer
docker build -t $REG/log-output-reader:1.0 part-1/log-output/reader
docker build -t $REG/ping-pong:1.0         part-1/ping-pong
docker build -t $REG/the-project:1.0       part-1/project
# import into k3d (no push needed)
for i in log-output-writer log-output-reader ping-pong the-project; do
  k3d image import $REG/$i:1.0 -c devops
done

kubectl apply -f part-1/ping-pong/manifests
kubectl apply -f part-1/log-output/manifests
kubectl apply -f part-1/project/manifests

kubectl get pods
curl localhost:8081/            # log-output: "<timestamp>: <uuid>"
curl localhost:8081/pingpong    # "pong N"
```

## Deploy Part 2 (k3d)

```bash
REG=ghcr.io/maxim955827848
# build + import the v2 images
docker build -t $REG/log-output-writer:2.0 part-2/log-output/writer
docker build -t $REG/log-output-reader:2.0 part-2/log-output/reader
docker build -t $REG/ping-pong:2.0         part-2/ping-pong
docker build -t $REG/project-backend:2.0   part-2/project/backend
docker build -t $REG/project-frontend:2.0  part-2/project/frontend
for i in log-output-writer:2.0 log-output-reader:2.0 ping-pong:2.0 project-backend:2.0 project-frontend:2.0; do
  k3d image import $REG/$i -c devops
done

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

## Deploy Part 4 messaging (ex 4.06)

The project backend publishes a `todos.created` event to NATS on every new todo
(only when `NATS_URL` is set — it already is in `backend.yaml`). The broadcaster
consumes those events.

```bash
REG=ghcr.io/maxim955827848
docker build -t $REG/broadcaster:1.0 part-4/messaging/broadcaster
k3d image import $REG/broadcaster:1.0 -c devops

kubectl apply -f part-4/messaging/nats.yaml          # broker (project ns)
kubectl apply -f part-4/messaging/broadcaster.yaml   # consumer
# create a todo, then watch the consumer react:
kubectl logs -n project -l app=broadcaster -f
```

## Prereqs
Docker, `kubectl`, `k3d`, a GitHub account (for GHCR). Parts 3+ additionally
need a Google Cloud account (GKE).
