# Reflection: Kubernetes NetworkPolicies (ex 5.03)

External material studied: the Kubernetes docs on **NetworkPolicies** and the
**Cilium** "network policy" tutorial.

By default, every pod in a cluster can talk to every other pod — a flat, open
network. That's convenient but a poor security posture: a single compromised
pod can reach the database, the message broker, everything.

**NetworkPolicies** fix this by letting you declare allowed ingress/egress at the
pod level (selected by labels). The mental model is a **default-deny** baseline
plus explicit allow rules: e.g. only `app: project-backend` may reach
`app: postgres` on 5432; the frontend may reach the backend but not the DB
directly; the daily CronJob may reach the backend only.

Two things stood out:
1. **The CNI must enforce them.** NetworkPolicy is just an API object — plain
   flannel (k3d's default) ignores it. You need a policy-aware CNI like
   **Cilium** or **Calico** for the rules to actually take effect. This is an
   easy, dangerous gap: you write policies, they appear to apply, but nothing is
   enforced.
2. **Egress policies matter as much as ingress.** Restricting *outbound* traffic
   limits what an attacker can exfiltrate or call out to.

Applied to this project, I'd add a default-deny policy per namespace and then
allow only the specific flows shown in `docs/architecture.md`. It's a high
security return for low effort once a policy-aware CNI is in place.
