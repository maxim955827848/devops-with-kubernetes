# DevOps with Kubernetes 2026 — submissions

Solutions for the University of Helsinki **DevOps with Kubernetes** course,
organized **by application** (like the course's reference submissions repo),
not by part. The apps evolve through the course — earlier states of each app
live in the git history.

## Layout

```
log_output/      log-output app: writer + reader, shared volume, ConfigMap message,
                 reader also fetches the ping count over the network
ping-pong/       ping-pong app: GET /pingpong increments a counter stored in PostgreSQL
postgres/        shared PostgreSQL StatefulSet (used by ping-pong and the project)
the_project/     the main project (todo app)
    todo-app/        frontend/ + backend/ (REST API, todos in PostgreSQL, NATS publisher)
    broadcaster/     NATS consumer microservice
    manifests/       deployments, services, ingress, namespaces, cronjob,
                     resource requests/limits + HPA, GCS backup CronJob
    argo-rollouts/   canary Rollout + Prometheus AnalysisTemplate
    messaging/       NATS broker + broadcaster deployment
    argocd/          GitOps Application + Image Updater annotations
crd-controller/  DummySite CRD + kopf controller
wikipedia/       initContainer + sidecar Pod
docs/            essays & notes (architecture, DBaaS, probes, platform comparison,
                 reflection, CNCF landscape, install notes)
.github/workflows/   CI/CD: build → push to GHCR → deploy to GKE, PR preview envs
```

## Exercise map

| Ex | What | Where |
|----|------|-------|
| 1.01 | log-output app (timestamp+uuid) | `log_output/` *(part-1 state in git history)* |
| 1.02–1.08 | project + log-output Deployments/Services/Ingress | `the_project/`, `log_output/manifests/` |
| 1.09 | ping-pong service | `ping-pong/` |
| 1.10 | log-output split writer/reader (shared volume) | `log_output/` |
| 1.11 | ping-pong counter persisted | *git history (superseded by 2.07 PostgreSQL)* |
| 1.12 | project caches image 24h on PV | *git history (part-1 project)* |
| 1.13 | project todo UI | `the_project/todo-app/` |
| 2.01 | reader fetches ping count over network | `log_output/reader/` |
| 2.02 | project split frontend + backend | `the_project/todo-app/` |
| 2.03 / 2.04 | namespaces | `the_project/manifests/namespaces.yaml` |
| 2.05 | Secret as env var | `ping-pong/manifests/` |
| 2.06 | ConfigMap | `log_output/manifests/configmap.yaml` |
| 2.07 | ping-pong counter in PostgreSQL | `ping-pong/`, `postgres/` |
| 2.08 | project todos in PostgreSQL | `the_project/todo-app/backend/`, `postgres/` |
| 2.09 | daily CronJob creates a todo | `the_project/manifests/cronjob.yaml` |
| 2.10 | labels/annotations | all manifests |
| 3.01 / 3.02 | deploy to GKE + cloud Ingress | deploy step (reuses the manifests) |
| 3.03 | CI/CD pipeline | `.github/workflows/deploy.yaml` |
| 3.04 / 3.05 | PR preview env + teardown | `.github/workflows/preview-env.yaml` |
| 3.06 | DBaaS vs DIY essay | `docs/DBaaS_vs_DIY.md` |
| 3.07 | DB backup CronJob to GCS | `the_project/manifests/backup-cronjob.yaml` |
| 3.08 / 3.09 | resource requests & limits | every container + `the_project/manifests/resources-and-hpa.yaml` |
| 3.10 | HorizontalPodAutoscaler | `the_project/manifests/resources-and-hpa.yaml` |
| 3.11 | architecture diagram | `docs/architecture.md` |
| 4.01 / 4.02 | readiness/liveness probes | `docs/probes.md` |
| 4.03 | Prometheus + Grafana | install (`docs/install-notes.md`) |
| 4.04 / 4.05 | Argo Rollouts canary + Prometheus analysis | `the_project/argo-rollouts/` |
| 4.06 | NATS broker + publisher + consumer | `the_project/messaging/`, `the_project/broadcaster/`, publisher in `the_project/todo-app/backend/index.js` |
| 4.07 / 4.08 | ArgoCD GitOps + image-update loop | `the_project/argocd/` |
| 5.01 | CRD `DummySite` + kopf controller | `crd-controller/` |
| 5.02 | service mesh (Linkerd, mTLS) | install (`docs/install-notes.md`) |
| 5.03 | external-material reflection | `docs/reflection.md` |
| 5.04 | initContainer + sidecar pod | `wikipedia/pod.yaml` |
| 5.05 | platform comparison essay | `docs/Platform_Comparison.md` |
| 5.06 / 5.07 | serverless (Knative scale-to-zero) | install (`docs/install-notes.md`) |
| 5.08 | CNCF landscape writeup | `docs/landscape.md` |

> **Note:** an entry being listed here means the code/manifests are written and the
> app logic is verified locally. The course only marks an exercise complete once it
> is **deployed and running in your cluster** — that step is done per submission.

## Container registry

Images use the GHCR namespace `ghcr.io/maxim955827848` (concrete names, no
placeholders). For local k3d, build with that name and `k3d image import`; for
GKE/ArgoCD, push to GHCR and make the packages public or add an `imagePullSecret`.

```bash
REG=ghcr.io/maxim955827848
echo "$GHCR_TOKEN" | docker login ghcr.io -u maxim955827848 --password-stdin
```

## Deploy locally (k3d)

```bash
brew install k3d
k3d cluster create devops -p "8081:80@loadbalancer"

REG=ghcr.io/maxim955827848
# build + import the app images
docker build -t $REG/log-output-writer:1.0 log_output/writer
docker build -t $REG/log-output-reader:1.0 log_output/reader
docker build -t $REG/ping-pong:1.0         ping-pong
docker build -t $REG/project-backend:1.0   the_project/todo-app/backend
docker build -t $REG/project-frontend:1.0  the_project/todo-app/frontend
for i in log-output-writer log-output-reader ping-pong project-backend project-frontend; do
  k3d image import $REG/$i:1.0 -c devops
done

# namespaces
kubectl apply -f the_project/manifests/namespaces.yaml

# secrets (copy the .example templates, set values — real ones are gitignored)
cp postgres/postgres-secret.example.yaml postgres/postgres-secret.yaml
cp ping-pong/manifests/ping-pong-secret.example.yaml ping-pong/manifests/ping-pong-secret.yaml
kubectl apply -f postgres/postgres-secret.yaml -n exercises
kubectl apply -f postgres/postgres-secret.yaml -n project
kubectl apply -f ping-pong/manifests/ping-pong-secret.yaml -n exercises

# postgres into both namespaces
kubectl apply -f postgres/service.yaml -f postgres/statefulset.yaml -n exercises
kubectl apply -f postgres/service.yaml -f postgres/statefulset.yaml -n project

# apps
kubectl apply -f ping-pong/manifests/deployment.yaml -f ping-pong/manifests/service.yaml
kubectl apply -f log_output/manifests/
kubectl apply -f the_project/manifests/
```

### Part 4 messaging (ex 4.06)

```bash
docker build -t $REG/broadcaster:1.0 the_project/broadcaster
k3d image import $REG/broadcaster:1.0 -c devops
kubectl apply -f the_project/messaging/nats.yaml
kubectl apply -f the_project/messaging/broadcaster.yaml
kubectl logs -n project -l app=broadcaster -f   # watch events after creating a todo
```

## Prereqs
Docker, `kubectl`, `k3d`, a GitHub account (for GHCR). Parts 3+ additionally need
a Google Cloud account (GKE).
