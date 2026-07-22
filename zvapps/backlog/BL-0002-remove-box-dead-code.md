---
id: BL-0002
title: Remove Box dead code
status: queued
priority: p2
created-by: "agent:heavy"
owner: heavy
created-date: 2026-07-22
updated-date: 2026-07-22
---

BoxPage.jsx, server/writeVector.js, and the Anthropic proxy in vite.config.js are unrouted since 2.0 (Decision 7) but still present. Already marked deprecated in docs/MIGRATION-2.0.md. Delete them and drop the /api/write-vector endpoint.