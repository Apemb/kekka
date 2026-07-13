# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Kekka is a zero-dependency TypeScript library providing two immutable value objects for business logic:
- **`Result`** — Rust-inspired Success/Failure monad for the "happy path / manageable business failure / unexpected error" three-way flow.
- **`Optional`** — Java-inspired Some/Empty monad to replace `undefined` guard clauses.

The published package (`main`/`types` → `dist/`) is the compiled output; source lives in `src/` and `index.ts`.

## Commands

```bash
npm test                 # run the full mocha suite (ts-node, no build step)
npm run lint             # eslint --fix over src/ and test/
npm run build            # tsc → dist/ (emits .js + .d.ts)

# run a single test file
npx mocha --node-option import=tsx --extension ts test/optional.test.ts
# run tests matching a description
npx mocha --recursive --node-option import=tsx --extension ts 'test/**/*.test.ts' --grep "merge"
```

Node version is pinned via `.tool-versions` (asdf). Mocha loads tests through `tsx`'s ESM loader (`--node-option import=tsx`), which transpiles TypeScript via esbuild and handles the ESM-only test deps (chai 6). `tsx` does **not** type-check, so type errors surface via `npm run build` / `tsc`, not the test run — and the `test/` dir is excluded from `tsconfig`, so tests are only type-checked in-editor.

## Architecture

### Cross-module identity via API version (not `instanceof`)
`isResult` / `isOptional` deliberately **do not** use `instanceof`. They duck-type on a version constant (`kekkaPublicApiVersion === KEKKA_API_VERSION`, `kekkaOptionalPublicApiVersion === KEKKA_OPTIONAL_API_VERSION`). This is the central design decision: in a monorepo, two copies of the package loaded from different `node_modules` produce distinct classes, so `instanceof` would fail. Bumping the API version constant is therefore a **breaking change** — objects from different major versions stop recognizing each other. Keep the constant in sync with the package major version.

### Callback convention: map and flatMap unified
`Result.onSuccess`/`onFailure` and `Optional.map` share one rule: if the callback returns a `Result`/`Optional`, it is returned **as-is** (flatMap); any other value is **wrapped** (map) — even `undefined`. For `Optional.map`, a returned `null`/`undefined` becomes `Empty` (via `ofNullable`). This means callers rarely need to wrap return values manually.

### Construction
Constructors are private. Build only through static factories (`Result.fromSuccess`/`fromFailure`, `Optional.of`/`empty`/`ofNullable`) or their exported aliases (`Success`, `Failure`, `Some`, `Empty`). `unwrap()` returns the value on success and **throws** the stored error on failure.

### Side-effect extension modules (important gotcha)
`index.ts` imports two modules purely for their side effects:
- `src/result-promise-extension.ts` — monkey-patches the **global** `Promise.prototype` with `thenOnSuccess`/`thenOnFailure` and adds `Promise.resolveFromSuccess`/`resolveFromFailure`. Opt-in: it only activates once the package is imported.
- `src/result-optional-extension.ts` — augments the `Result`/`Optional` prototypes with `toOptional()`/`toResult()`.

These methods are declared to TypeScript via `declare module` / `declare global`, so the **types always claim they exist**, but at runtime they only exist if the side-effect module was loaded. Consequence: importing from `./src/result` or `./src/optional` directly (as some tests do) gives you objects whose `toOptional`/`toResult`/promise helpers are `undefined` at runtime despite typechecking. Always go through the package entry (`index.ts`) when those cross-type helpers are needed.

## Testing conventions
- Mocha + Chai (`expect` BDD style) + `chai-as-promised`, wired in `test/test-helper.ts`. Chai 6 is ESM-only with named exports — import as `import { use, expect } from 'chai'`, not a default import.
- Chai assertions like `expect(x).to.be.true` are property expressions, so `test/.eslintrc` disables both `no-unused-expressions` and `@typescript-eslint/no-unused-expressions`.
- Tests that exercise the side-effect extensions must load them with a **static** side-effect import (`import '../src/result-promise-extension'`), never a floating `import(...)` — under `tsx` the dynamic form resolves too late and the prototype patch isn't applied when the test runs.
