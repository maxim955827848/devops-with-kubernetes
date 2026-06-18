# Platform comparison: Kubernetes vs alternatives (ex 5.05)

| | Kubernetes | Docker Swarm | HashiCorp Nomad | AWS ECS/Fargate |
|---|---|---|---|---|
| Operational complexity | High | Low | Medium | Low (managed) |
| Learning curve | Steep | Gentle | Moderate | Moderate |
| Resource overhead | High (control plane, etcd) | Low | Low (single binary) | None self-run (managed) |
| Workload types | Containers + CRDs (anything) | Containers | Containers, VMs, binaries, batch | Containers |
| Ecosystem | Massive (CNCF, Helm, operators) | Shrinking | Smaller but solid | AWS-native |
| Lock-in | Portable (any cloud / on-prem) | Portable | Portable | AWS only |
| Best fit | Complex microservices needing extensibility & scale | Small teams wanting simple container orchestration | Mixed workloads, simplicity at scale | Teams all-in on AWS wanting minimal ops |

## Takeaways
- **Docker Swarm** is the easiest to learn and run, but its ecosystem and momentum
  have faded; fine for small, stable deployments.
- **Nomad** is a single Go binary that schedules containers *and* non-container
  workloads, with far less operational weight than Kubernetes — great when you
  don't need the full CNCF ecosystem.
- **ECS/Fargate** removes nearly all ops burden but locks you to AWS and its
  primitives.
- **Kubernetes** wins on extensibility (CRDs/operators), portability, and ecosystem
  — at the cost of being the most complex to operate. For this project's goals
  (learning cloud-native patterns, portability across clouds), Kubernetes is the
  right pick; for a small team just shipping a few containers, Swarm or Nomad
  would be less overhead.
