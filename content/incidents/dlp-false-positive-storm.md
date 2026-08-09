---
publish: true
title: "The DLP Rule That Cried Wolf: 40,000 False Positives in One Weekend"
date: 2024-09-14
category: security
severity: sev2
summary: "A regex change in a DLP policy matched build artifacts across 250+ lab environments. Alert fatigue nearly buried a real exfiltration attempt."
tags: [dlp, alerting, automation]
---

## What happened

A routine update to a data-loss-prevention pattern, intended to catch serial-number formats, shipped Friday evening. The regex was one character too greedy. By Monday, 40,000 alerts had queued across 250+ environments, and the on-call rotation had silently muted the channel.

Buried at alert 31,207: a real, low-and-slow exfiltration attempt.

## Why it happened

- No canary stage for DLP policy changes, rules went straight to global.
- Alert volume had no circuit breaker; the pipeline happily delivered everything.
- Muting the channel was easier than tuning the rule. Humans take the easy path, design for it.

## What was built so it can't recur

1. **Staged rollout**: policy changes deploy to a 5-environment canary ring for 48 hours, with an automated diff of alert volume vs. baseline.
2. **Volume circuit breaker**: >3σ alert spike from a single rule auto-suppresses the rule (not the channel) and pages the rule owner.
3. **Python triage pipeline**: dedupe + cluster before human eyes. 40,000 raw events would now surface as ~12 clusters.

> Lesson: alert pipelines fail open in the worst way, by training humans to ignore them. Rate-limit the machine, not the human.
