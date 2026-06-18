# Readiness & liveness probes (ex 4.01, 4.02)

Add these blocks to the container specs. The apps already expose `/healthz`
(frontend & backend) — ping-pong/log-output use their existing routes.

## Project frontend & backend (ex 4.02 — /healthz)
```yaml
          readinessProbe:
            httpGet:
              path: /healthz
              port: 3001        # frontend: 3000
            initialDelaySeconds: 5
            periodSeconds: 10
          livenessProbe:
            httpGet:
              path: /healthz
              port: 3001
            initialDelaySeconds: 10
            periodSeconds: 15
```

## ping-pong (ex 4.01) — uses /pings (also checks the DB connection)
```yaml
          readinessProbe:
            httpGet: { path: /pings, port: 3000 }
            initialDelaySeconds: 5
            periodSeconds: 10
          livenessProbe:
            httpGet: { path: /pings, port: 3000 }
            initialDelaySeconds: 10
            periodSeconds: 15
```

## log-output (ex 4.01) — reader serves /
```yaml
          readinessProbe:
            httpGet: { path: /, port: 3000 }
            initialDelaySeconds: 5
            periodSeconds: 10
          livenessProbe:
            httpGet: { path: /, port: 3000 }
            initialDelaySeconds: 10
            periodSeconds: 15
```
