# DevOps with Kubernetes — submission repo

Solutions for the University of Helsinki **DevOps with Kubernetes** course.
Each exercise lives in its own folder with the app code, a `Dockerfile`, and
Kubernetes manifests under `manifests/`.

## Status
- **Part 1** — scaffolded and ready to deploy:
  - `log-output/` — exercise 1.1 (app) + 1.2 (deployment)
  - `the-project/` — exercise 1.3 (app) + 1.4 (deployment)
- Parts 2–5: added incrementally as each is built and deployed.

## Prerequisites (install once)
- Docker Desktop
- `kubectl`
- `k3d` (local Kubernetes): `brew install k3d`
- A Docker Hub account (to host images), or use the local-image import shown below.

## Run Part 1 locally (k3d)

```bash
# 1. Create a local cluster
k3d cluster create devops

# 2a. Build images
docker build -t <DOCKERHUB_USER>/log-output:1.0 ./log-output
docker build -t <DOCKERHUB_USER>/the-project:1.0 ./the-project

# 2b. Either push to Docker Hub...
docker push <DOCKERHUB_USER>/log-output:1.0
docker push <DOCKERHUB_USER>/the-project:1.0
#    ...or import the local images straight into k3d (no push needed):
k3d image import <DOCKERHUB_USER>/log-output:1.0 -c devops
k3d image import <DOCKERHUB_USER>/the-project:1.0 -c devops

# 3. Edit the two manifests/deployment.yaml files, replacing <DOCKERHUB_USER>.

# 4. Apply
kubectl apply -f log-output/manifests/deployment.yaml
kubectl apply -f the-project/manifests/deployment.yaml

# 5. Verify
kubectl get pods
kubectl logs -f <log-output-pod-name>        # should print "<timestamp>: <uuid>" every 5s
kubectl logs <the-project-pod-name>           # should print "Server started in port 3000"
```

## Notes
- The grader for this course is your **deployed cluster + this repo**, so the
  exercise only counts once the pods are actually running (verify with the
  commands above).
- Later parts add Services, Ingress, ConfigMaps/Secrets, StatefulSets,
  persistent storage, GKE, and GitOps — built one part at a time.
