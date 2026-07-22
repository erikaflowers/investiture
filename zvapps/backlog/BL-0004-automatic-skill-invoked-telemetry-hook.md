---
id: BL-0004
title: Automatic skill-invoked telemetry hook
status: proposed
priority: p1
created-by: "agent:heavy"
owner: heavy
created-date: 2026-07-22
updated-date: 2026-07-22
---

Recency cards and skill telemetry currently depend on agents following the CLAUDE.md rituals — there is no automatic emission. This is the v1.5 skill-execution-hooks gap carried forward. A Claude Code hook (e.g. on skill invocation) should append skill-invoked events to zvapps/telemetry/events.jsonl so the Overview and Skills pages reflect reality without relying on agent compliance.