---
title: Modern DevOps Coverage
slug: learning/devops/modern-devops-coverage
description: Coverage map for the DevOps and deployment learning track, including containers, CI/CD, observability, and runtime operations.
---

import LessonMeta from '../../../../components/LessonMeta.astro'
import Callout from '../../../../components/Callout.astro'
import KeyConcept from '../../../../components/KeyConcept.astro'

<LessonMeta level="Intermediate" duration="10 min" track="DevOps" prerequisites="The other pages in this track" />

The DevOps tooling landscape is enormous and churny. This page is an opinionated tour of what actually shows up in production Node.js shops in 2026 — what each tool is for, who it replaces, and when to reach for it. Use it as a shopping list, not a study list.

<KeyConcept title="Tools are interchangeable. Principles are not.">
Every tool here can be replaced with a competitor. The principles from the preceding pages — build once, promote the digest, symptom-based alerts, expand/contract migrations — are what carry across tool swaps. Learn the principles; pick the tools your employer is already paying for.
</KeyConcept>

## Packaging and local dev

- **Docker / BuildKit** — the default. Multi-stage, `--mount=type=cache`, SBOM and provenance via `docker buildx build --provenance=true --sbom=true`.
- **Docker Compose** — still the lowest-friction way to run a Node service plus Postgres, Redis, and a tracer locally. Use profiles to keep the default `up` fast.
- **Podman / nerdctl** — drop-in Docker replacements if your org forbids the Docker daemon. Same Dockerfile syntax.
- **Dev Containers (`.devcontainer/`)** — VS Code and GitHub Codespaces use this to give every contributor the same Node, psql, and Redis versions.

## Orchestration

- **Kubernetes** — still the default for anything bigger than a handful of services. The bits to know: Deployment, Service, Ingress, ConfigMap, Secret, HorizontalPodAutoscaler, PodDisruptionBudget, NetworkPolicy.
- **Helm / Kustomize** — templating over raw YAML. Kustomize is simpler; Helm wins when you need to distribute charts.
- **Fly.io, Render, Railway** — "like Heroku, but for the 2020s." Great for teams under ~20 services that do not want to run Kubernetes themselves. Global anycast, regional Postgres, built-in builders.
- **AWS ECS/Fargate, Cloud Run, Azure Container Apps** — managed container runtimes for teams already inside a big cloud. Less flexible than Kubernetes, far less operational overhead.

<Callout type="tip" title="Do not adopt Kubernetes by default">
Kubernetes is an operating system for clusters. If you have three services, four engineers, and no dedicated platform team, Fly.io or Cloud Run will outperform a DIY Kubernetes setup for years before the tradeoff flips.
</Callout>

## CI / CD

- **GitHub Actions** — the path of least resistance if your code lives on GitHub. OIDC to AWS/GCP/Azure, self-hosted runners for private networks, composite actions for reuse.
- **GitLab CI, CircleCI, Buildkite** — still competitive if you are already on them. Buildkite's agent model is the cleanest for self-hosted fleets.
- **Argo CD / Flux** — GitOps: a git repo is the desired state of your cluster, a controller reconciles drift. Non-negotiable past a few dozen services.
- **Argo Rollouts, Flagger** — progressive delivery on top of Kubernetes. Canary, blue-green, analysis from Prometheus before promotion.
- **Dagger, Earthly** — "CI pipelines as code you can run locally." Useful if your `.github/workflows/*.yml` has become a 2000-line monster.

## Secrets and config

- **HashiCorp Vault, AWS Secrets Manager, GCP Secret Manager** — centralised secret stores with rotation and audit trails.
- **Doppler, Infisical, 1Password Connect** — dev-team-friendly secret managers with good CLI and SDK stories.
- **SOPS + age/PGP** — encrypt `.env` files and commit them. Great for small teams who want GitOps of their config.
- **External Secrets Operator** — syncs a cloud secret store into Kubernetes Secrets so your apps can mount them normally.

## Observability

- **Prometheus + Grafana** — the open-source default. Metrics + dashboards. Loki for logs, Tempo for traces if you want a full free stack.
- **OpenTelemetry** — vendor-neutral SDK and wire format. Instrument once, export anywhere.
- **Datadog, New Relic, Dynatrace** — full-stack SaaS with auto-instrumentation for Node.js. Pay for it if you want one pane of glass and do not want to run Prometheus yourself.
- **Honeycomb** — trace-first, high-cardinality queries ("which user ids had p99 > 2s in the last 5 minutes?"). Worth learning even if you use something else.
- **Sentry, Rollbar** — error aggregation with source maps and release tracking. Complementary to metrics/traces, not a replacement.
- **Grafana Cloud, Chronosphere** — managed Prometheus + Loki + Tempo if you want the open stack without the ops burden.

## Feature flags and experimentation

- **LaunchDarkly, Statsig, Optimizely** — full platforms with targeting, experimentation, and SDKs.
- **Unleash, GrowthBook, OpenFeature** — open-source alternatives. OpenFeature is the API spec that lets you swap providers.
- **Config flags in your own DB** — fine for a team of five. Stops scaling when you want targeting, experimentation, or audit trails.

## Security, supply chain, compliance

- **Trivy, Grype** — container image scanning for CVEs. Run in CI; fail on high severity.
- **Snyk, Dependabot, Renovate** — dependency updates and vulnerability alerts.
- **Sigstore / cosign** — sign your images with a keyless OIDC identity. Verify signatures at deploy time.
- **SLSA levels** — supply-chain provenance. SLSA 2 is achievable with GitHub Actions + `actions/attest-build-provenance`. SLSA 3+ needs hardened builders.
- **OPA / Gatekeeper / Kyverno** — policy-as-code for Kubernetes admission. "No pod may run as root," enforced at deploy time.

## Cost and capacity

- **OpenCost, Kubecost** — Kubernetes cost allocation by namespace/label.
- **AWS Cost Explorer / GCP Recommender** — right-sizing suggestions. Usually conservative; treat as a starting point.
- **`k6`, `wrk`, `autocannon`** — load generators for capacity tests. Use them against staging before every major release, not just when something feels slow.

## Operational runtime helpers

- **PM2** — process manager; mostly replaced by container orchestrators for prod, still convenient for VMs.
- **systemd** — if you run Node on bare VMs, the correct way to manage the lifecycle is a systemd unit with `Restart=always`, `LimitNOFILE`, and `sd_notify` readiness.
- **Cron / Kubernetes CronJob** — scheduled jobs. For anything non-trivial, graduate to Temporal or BullMQ so you get retries and visibility.

## Picking a stack from scratch

If you were starting a new Node.js shop today and wanted a defensible stack:

- Code + CI: GitHub + GitHub Actions with OIDC
- Registry: GHCR
- Runtime: Fly.io or Cloud Run up to ~20 services, then Kubernetes + Argo CD
- Secrets: Doppler (or AWS Secrets Manager if AWS-native) + External Secrets in Kubernetes
- Metrics/logs/traces: OpenTelemetry SDK + Grafana Cloud (or Datadog if budget allows)
- Errors: Sentry
- Flags: OpenFeature with GrowthBook or Unleash behind it
- Security: Trivy in CI, cosign signatures, Renovate for deps

<Callout type="info" title="The point of this list">
Nothing above is mandatory. The point is that every row is a decision your team will be asked to defend. Having a considered default saves weeks of bikeshedding per year.
</Callout>

## Further reading

- [Environment, Config, Docker, and Containers](/learning/devops/environment-config-docker-containers/)
- [CI, CD, Release Flow, and Deployment](/learning/devops/ci-cd-release-flow-and-deployment/)
- [Observability, Runtime Operations, and Runbooks](/learning/devops/observability-runtime-operations-and-runbooks/)
- [Labs, Projects, Interview Questions, Case Studies](/learning/devops/labs-projects-interview-case-studies/)
