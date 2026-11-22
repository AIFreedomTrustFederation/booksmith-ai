# Booksmith AI — Optional AIFT Universal OS Publishing Application

> **Informational architecture alignment.** This repository remains the independent author-first, local-first manuscript and publishing studio. The proposed [AIFT-OS native/hosted/embodied platform and infographics](https://github.com/AIFreedomTrustFederation/AIFT-OS/pull/92) do not establish a shipped Booksmith desktop app or hardware OS component, and do not alter manuscripts, canonical registry or rights.

## Actual source of truth

The Booksmith library remains based on library/book-registry.json and the per-book configuration/manuscript/source/assets/LaTeX/export structure. Author sovereignty, manuscript privacy, provider choice, attribution and human editorial approval are unchanged. A book release, cloud sync or marketplace publication cannot be initiated by an OS integration document.

## Future opt-in app integration

Booksmith could expose a reviewed application manifest that declares a native/hosted AIFT desktop entry point, local library permissions, offline fallback, and optional explicit user-scoped file/AI integration. The **AIFT desktop is a client**; Booksmith remains authoritative for authoring data, book configuration and publishing operations.

~~~mermaid
flowchart LR
  LIBRARY["Booksmith canonical real library"] --> APP["Optional reviewed Booksmith app adapter"]
  APP -. "target/permission verified" .-> DESKTOP["Proposed AIFT hosted / native desktop"]
  OWNER["Author consent and editorial authority"] --> APP
  PROOF["Real book/source and tests"] --> APP
~~~

## Acceptance evidence before implementation claims

1. Verify actual library registry and book/config state rather than creating sample manuscripts, fake author profiles or invented progress.
2. Define app manifest ownership/version, supported targets, scoped storage, offline export and permission denial.
3. Validate source-preserving file operations, real manuscript provenance and local-first AI model boundaries.
4. Run existing Booksmith lint/typecheck/test/build/library and smoke gates appropriate to changed code, plus actual native/hosted application acceptance if implemented.
5. Never claim a mobile/phone/robot/firmware compatibility or production app install unless matching artifacts and hardware-specific tests exist.

## Safety / rights boundaries

Do not sync externally, move money, change rights/visibility, publish books, delete manuscripts, connect third-party accounts, expose drafts or invoke premium providers without explicit author approval. This document changes no application code, registry, manuscript, backend, credentials or release settings.

[Central AIFT platform proposal](https://github.com/AIFreedomTrustFederation/AIFT-OS/pull/92) · [Booksmith current repository](https://github.com/AIFreedomTrustFederation/booksmith-ai).
