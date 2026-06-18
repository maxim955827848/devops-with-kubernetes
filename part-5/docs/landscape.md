# CNCF Landscape: three projects (ex 5.08)

Three CNCF projects from categories not deeply covered in this course:

## 1. Cilium (Cloud Native Networking / CNI)
**Problem solved:** secure, high-performance pod networking and observability.
Built on **eBPF**, it enforces NetworkPolicies (including L7/HTTP-aware rules),
provides load balancing, and powers deep network observability (Hubble). It fits
as the **CNI layer** beneath everything — replacing the basic networking with
something security- and performance-focused. Relevant directly to ex 5.03.

## 2. OpenTelemetry (Observability)
**Problem solved:** vendor-neutral, standardized **traces, metrics, and logs**.
Instead of locking telemetry to one backend, apps emit OTel data through a
common SDK + Collector, which can route to Prometheus, Jaeger, Grafana, or a
commercial APM. It fits as the **instrumentation standard** — the natural next
step beyond the Prometheus scraping in ex 4.03, adding distributed tracing across
the frontend → backend → database calls.

## 3. Falco (Runtime Security)
**Problem solved:** **runtime threat detection.** Falco watches kernel syscalls
(via eBPF) and fires alerts on suspicious behavior — a shell spawned in a
container, unexpected outbound connections, writes to sensitive paths. It fits as
the **runtime-security layer**: NetworkPolicies and RBAC are preventative, Falco
is detective, catching what slips through once workloads are actually running.

Together these illustrate three distinct slices of the cloud-native stack —
**networking (Cilium), observability (OpenTelemetry), and runtime security
(Falco)** — that complement the deployment/GitOps tooling built in this course.
