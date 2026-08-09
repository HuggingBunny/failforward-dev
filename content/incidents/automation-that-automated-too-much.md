---
publish: true
title: "The Cleanup Script That Cleaned Up Production"
date: 2022-05-19
category: automation
severity: sev2
summary: "A lab-decommissioning script trusted its inventory input. The inventory was wrong. Three active environments were unenrolled from security tooling in eleven minutes."
tags: [python, guardrails, blast-radius]
---

## What happened

A Python script that decommissioned retired lab environments, removing agents, revoking certs, closing firewall rules, ran against a stale inventory export. Three environments marked "retired" in the export were very much in use. Eleven minutes later they were invisible to every security control we had.

## Why it happened

- The script trusted one input source with no freshness check.
- Destructive operations ran with no dry-run, no confirmation threshold, no rate limit.
- Speed was the design goal. Blast radius wasn't a requirement, until it was.

## What was built so it can't recur

1. **Two-source rule**: destructive automation must confirm state against two independent sources (CMDB + live telemetry) before acting.
2. **Dry-run by default**: `--execute` is opt-in; the default output is a diff for human review.
3. **Rate limiter with tripwire**: more than N destructive ops per run requires a signed approval file. The script physically cannot rush.
4. **Unenroll alarm**: security tooling now alerts on *loss* of an agent heartbeat from any environment not in a signed decommission list.

> Lesson: automation doesn't make mistakes faster than humans, it makes one mistake at scale. Guardrails are the feature.
