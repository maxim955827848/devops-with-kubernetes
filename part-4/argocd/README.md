# GitOps with ArgoCD (ex 4.07, 4.08)

## 4.07 — ArgoCD as source of truth
Apply `application.yaml`. ArgoCD watches `part-2/project/manifests` on `main`
and auto-syncs (with prune + self-heal) any committed change to the cluster.

## 4.08 — close the loop: CI updates image tags in Git
Add a final step to `.github/workflows/deploy.yaml` so that after building a new
image, the pipeline writes the new tag back into the manifests and commits it —
ArgoCD then deploys it automatically. Sketch:

```yaml
      - name: Bump image tag in Git (GitOps)
        run: |
          TAG=${GITHUB_SHA::8}
          sed -i "s#\(project-backend:\).*#\1$TAG#" part-2/project/manifests/backend.yaml
          git config user.name  "ci-bot"
          git config user.email "ci-bot@users.noreply.github.com"
          git commit -am "ci: bump backend image to $TAG" || echo "no change"
          git push
```
Better than `sed` for real use: `kustomize edit set image` or the ArgoCD Image Updater.
With this in place the flow is: push code → CI builds image → CI commits new tag →
ArgoCD syncs → cluster updated. No `kubectl` from CI needed.
