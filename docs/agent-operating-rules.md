# Booksmith AI Agent Operating Rules

These rules apply to ChatGPT, Codex, and all AI agent sessions working on Booksmith AI.

## Main-first rule

Work directly on `main` unless the human explicitly asks for a branch or pull request.

Do not create speculative dead-end branches for normal implementation work. If a branch already exists and is stale, either merge a clean replacement into `main` or close the dead-end branch/PR with a clear note.

## Real-data-first rule

Do not use mock books, fake manuscripts, fake projects, fake authors, fake word counts, fake progress bars, fake launch assets, or fictional placeholder data in product UI.

Use one of these instead:

1. real registry data from `library/book-registry.json`;
2. real book metadata from `books/<slug>/book.config.json`;
3. real manuscript/source folders already in the repo;
4. real connected source status, such as GitHub, Drive, or local import state;
5. honest empty states that ask the user to connect, import, or create a real source.

## Booksmith source-of-truth rule

The federated library spine is:

```text
library/book-registry.json
books/<slug>/book.config.json
books/<slug>/manuscript/
books/<slug>/sources/
books/<slug>/assets/
books/<slug>/latex/
books/<slug>/exports/
```

Every agent should preserve this structure and strengthen it.

## Required reading before changes

Before editing, read:

- `README.md`
- `AGENTS.md`
- this file
- `library/book-registry.json`
- relevant `books/*/book.config.json`
- the file being changed

## Validation rule

After changing registry or book structure, add or update validation so future agents can verify the same rule.

The target validation command is:

```bash
npm run validate:library
```

## Principle

One registry. Real books. Honest empty states. No fake content. No dead-end branches unless explicitly requested.
