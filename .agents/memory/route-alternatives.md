---
name: OSRM route alternatives
description: Durable routing constraint for EcoRoute’s three road-route choices.
---

Public OSRM does not guarantee three alternatives for every Kochi origin/destination pair, even when alternatives are requested. EcoRoute therefore uses separate snapped via-road queries for the cleanest and average candidates instead of drawing synthetic straight-line fallback paths.

**Why:** A single OSRM response can contain only one route, and schematic fallback lines do not represent roads or turns.

**How to apply:** Preserve real road geometry for every displayed route. If a provider request fails, leave that route geometry unavailable rather than drawing a straight line; keep the UI explicit about partial or unavailable routing data.