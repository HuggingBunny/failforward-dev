---
publish: true
title: "Ghost Assets: The M&A Network Nobody Owned"
date: 2023-11-02
category: infrastructure
severity: sev1
summary: "Post-acquisition integration surfaced an undocumented lab subnet with 200+ live devices, no CMDB entries, and one very expired certificate authority."
tags: [m-and-a, cmdb, asset-management, nmap]
---

## What happened

Six months into integrating an acquired company's lab infrastructure, a routine Nmap sweep found a /22 that existed on no network diagram, in no CMDB, owned by no team. 200+ live devices, test rigs, jump boxes, one domain controller, running against a certificate authority that had expired two years earlier.

## Why it happened

- The acquired org's tribal knowledge left with the engineers who took the retention-package exit.
- Integration checklists inventoried what was *documented*, not what was *reachable*.
- Nobody owned the question "what answers ping that shouldn't?"

## What was built so it can't recur

1. **Continuous discovery pipeline**: scheduled Nmap + passive DNS collection, diffed daily against CMDB via Python. Anything reachable-but-unregistered opens a ticket automatically.
2. **M&A day-zero scan**: full discovery sweep is now the *first* integration step, before any checklist reconciliation.
3. **Ownership as code**: every subnet requires a named owner in the CMDB record; unowned = auto-quarantined at the firewall after 30 days.

> Lesson: in M&A, the documentation is a claim, not a fact. Scan first, reconcile second.
