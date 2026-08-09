---
publish: true
title: "The AI Triage Assistant That Invented a CVE"
date: 2025-08-30
category: ai-systems
severity: lesson
summary: "An LLM-assisted vulnerability triage workflow confidently cited a CVE that does not exist. Caught in review, but only because the workflow was designed to assume it would lie."
tags: [ai, llm, guardrails, vuln-management]
---

## What happened

An experimental LLM workflow for prioritizing vulnerability scan output produced a beautifully reasoned justification for escalating a finding, anchored on a CVE identifier that has never been issued. Formatting: perfect. Severity math: plausible. CVE: fictional.

## Why it didn't become an incident

The workflow was built assuming confabulation from day one:

1. **Structured claims only**: the model must emit CVE IDs in a schema field, never prose.
2. **Deterministic validation**: every CVE ID is checked against the NVD API before the output renders. Fabricated ID → the entire triage item is flagged, not silently dropped.
3. **Provenance labels**: AI-generated content is visually labeled in the analyst UI, the reviewer knew exactly which claims needed verification.

This is the design philosophy behind the [AI Warning Labels](/#labels) project: treat model behavior as a hazard class, communicate it like one.

## What changed anyway

- Added a hallucination counter to the workflow's telemetry. Rate above threshold → model version is rolled back.
- Validation now covers CWE and vendor advisory IDs, not just CVEs.

> Lesson: don't build AI workflows that trust the model. Build workflows where the model's untrustworthiness is a designed-for input.
