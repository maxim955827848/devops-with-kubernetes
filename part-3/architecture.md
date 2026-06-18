# System architecture (exercise 3.11)

High-level diagram of the cloud-native system across the two namespaces.

```mermaid
flowchart TB
  user([User browser])
  user -->|HTTP| ingress[Ingress controller]

  subgraph exercises[namespace: exercises]
    lo_svc[Service: log-output-svc] --> lo[Deployment: log-output<br/>writer + reader]
    pp_svc[Service: ping-pong-svc] --> pp[Deployment: ping-pong]
    pp --> pgx[(StatefulSet: postgres<br/>+ PVC)]
    cm[ConfigMap] -.env.-> lo
    sec1[Secret: ping-pong] -.env.-> pp
    lo -->|GET /pings| pp_svc
  end

  subgraph project[namespace: project]
    fe_svc[Service: project-frontend-svc] --> fe[Deployment: frontend]
    be_svc[Service: project-backend-svc] --> be[Deployment: backend]
    fe -->|GET/POST todos| be_svc
    be --> pgp[(StatefulSet: postgres<br/>+ PVC)]
    cron[CronJob: daily-todo] -->|POST /todos| be_svc
    secp[Secret: postgres] -.env.-> be
    hpa[HPA] -.scales.-> be
  end

  ingress -->|/ , /pingpong| exercises
  ingress -->|project.localhost| project
```

> Replace this with an exported PNG if the course requires an image file; the
> Mermaid block above renders directly on GitHub.
