# DBaaS vs DIY: running PostgreSQL in Kubernetes vs a managed service

This note (exercise 3.06) weighs running our database ourselves inside the
cluster (a StatefulSet, "DIY") against a managed Database-as-a-Service such as
Google Cloud SQL.

## DIY — PostgreSQL as a StatefulSet in the cluster

**Pros**
- **No extra cost** beyond the node resources we already pay for — attractive on a
  student's $300 trial budget.
- **Portable**: the same manifests run on k3d locally and on any cluster; no cloud
  lock-in.
- **Everything in one place**: one `kubectl`, one set of RBAC/network policies, the
  DB lives next to the apps for low latency.
- **Full control** of version, extensions, and configuration.

**Cons**
- **You own the hard parts**: backups, point-in-time recovery, failover, version
  upgrades, storage resizing, and monitoring are all your responsibility.
- **Stateful workloads are the riskiest thing to run on Kubernetes** — a bad node
  drain, a lost PersistentVolume, or a misconfigured `subPath` can mean data loss.
- **High availability is genuinely hard** to do correctly (replication, leader
  election) and usually needs an operator (e.g. CloudNativePG, Zalando).

## DBaaS — Google Cloud SQL (managed)

**Pros**
- **Operational burden offloaded**: automated backups, PITR, patching, and
  one-click HA/replicas.
- **Reliability & SLA** backed by the provider; storage auto-grows.
- **Less to monitor** — the team focuses on the application, not on being DBAs.

**Cons**
- **Cost**: a managed instance bills continuously and is markedly more expensive
  than a pod — it will burn trial credits fast if left running.
- **Lock-in**: tied to the provider's APIs, networking, and IAM.
- **Less control**: limited extension/version choices; the DB lives outside the
  cluster, so connectivity (private IP / proxy) needs setup.

## Recommendation for this project

- **Learning / local / this course's budget:** the **DIY StatefulSet** is the right
  call — it's free, portable, and the whole point is learning how stateful
  workloads behave on Kubernetes.
- **Real production with real users:** I'd move to **managed Cloud SQL**. The data is
  the one thing you cannot afford to lose, and paying the provider to handle
  backups, failover, and patching is almost always cheaper than an outage or a
  3am recovery. Reserve DIY-in-cluster for cases needing strict data residency,
  cost control at large scale, or no managed option.

**Rule of thumb:** stateless app tiers belong in Kubernetes; the primary database
belongs in a managed service once it's carrying production data.
