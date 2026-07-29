# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Kekka is a zero-dependency TypeScript library providing two immutable value objects for business logic:
- **`Result`** — Rust-inspired Success/Failure monad for the "happy path / manageable business failure / unexpected error" three-way flow.
- **`Optional`** — Java-inspired Some/Empty monad to replace `undefined` guard clauses.

The published package (`main`/`types` → `dist/`) is the compiled output; source lives in `src/` and `index.ts`.

## Commands

```bash
npm test                 # run the full vitest suite (no build step)
npm run test:watch       # vitest in watch mode
npm run lint             # eslint --fix over src/ and test/
npm run build            # tsc → dist/ (emits .js + .d.ts)

# run a single test file
npx vitest run test/optional.test.ts
# run tests matching a description
npx vitest run -t "merge"
```

Node version is pinned via `.tool-versions` (mise). Vitest transpiles TypeScript through esbuild and does **not** type-check, so type errors surface via `npm run build` / `tsc`, not the test run.

### Two tsconfigs, on purpose

`tsconfig.json` is the **build** scope: what it includes is what `tsc` emits into `dist/`, which is why `test/` is excluded from it. `tsconfig.eslint.json` is the **lint** scope, widened to cover `test/` and `vitest.config.ts`, because the type-aware ESLint rules need type information for every file they lint. Adding `test/` to the build tsconfig instead would ship the tests into `dist/`.

### The runner config lives in `vitest.config.ts`

It holds nothing but `include: ['test/**/*.test.ts']`. Globals are deliberately **not** enabled: every test file imports `describe` / `it` / `expect` from `vitest` explicitly.

IntelliJ detects Vitest from `package.json` and produces run configurations for a test, a suite, a file **or a directory**. That last one matters: the Mocha producer this project used before never claimed directories, so `Ctrl+Shift+R` on `test/` fell through to whichever other plugin answered — the Python plugin, on a project without a line of Python.

## Architecture

### Cross-module identity via API version (not `instanceof`)
`isResult` / `isOptional` deliberately **do not** use `instanceof`. They duck-type on a version constant (`kekkaPublicApiVersion === KEKKA_API_VERSION`, `kekkaOptionalPublicApiVersion === KEKKA_OPTIONAL_API_VERSION`). This is the central design decision: in a monorepo, two copies of the package loaded from different `node_modules` produce distinct classes, so `instanceof` would fail. Bumping the API version constant is therefore a **breaking change** — objects from different major versions stop recognizing each other. Keep the constant in sync with the package major version.

### Callback convention: map and flatMap unified
`Result.onSuccess`/`onFailure` and `Optional.map` share one rule: if the callback returns a `Result`/`Optional`, it is returned **as-is** (flatMap); any other value is **wrapped** (map) — even `undefined`. For `Optional.map`, a returned `null`/`undefined` becomes `Empty` (via `ofNullable`). This means callers rarely need to wrap return values manually.

### Construction
Constructors are private. Build only through static factories (`Result.fromSuccess`/`fromFailure`, `Optional.of`/`empty`/`ofNullable`) or their exported aliases (`Success`, `Failure`, `Some`, `Empty`). `unwrap()` returns the value on success and **throws** the stored error on failure.

### Cross-type conversion and the circular import
`Result.toOptional()` and `Optional.toResult()` are **real instance methods** on their classes, so `result.ts` and `optional.ts` import each other. This circular import is safe because each side only references the other **inside a method body** (call time), never at module load / top-level. Do not add a top-level `export const X = OtherClass.something` referencing the other module — that would evaluate during load, when the other class is still undefined, and break.

### Side-effect extension: global Promise helpers (important gotcha)
`index.ts` imports `src/result-promise-extension.ts` purely for its side effect: it monkey-patches the **global** `Promise.prototype` with `thenOnSuccess`/`thenOnFailure` and adds `Promise.resolveFromSuccess`/`resolveFromFailure`. Declared to TypeScript via `declare global`, so the **types always claim these exist**, but at runtime they only exist once the package (or that module) has been imported. Importing from `./src/result` directly, without loading the extension, gives you Promises whose helpers are `undefined` despite typechecking.

## Testing conventions
- Vitest with Jest-style matchers (`toBe`, `toStrictEqual`, `toThrow`, `resolves`). `describe` / `it` / `expect` are imported from `vitest` in each file.
- `test/test-helper.ts` exposes a single helper, `thrownBy(fn)`, which returns the thrown error so it can be compared **by identity**. `expect(fn).toThrow(error)` only compares the *message*, which makes two distinct errors with the same wording interchangeable — and the `Result.merge` test deliberately builds two errors carrying the identical message `'First error'` to prove the *first* one comes back. Use `thrownBy` wherever the identity of the error is the point; plain `toThrow('…')` is fine when only the message matters.
- Async assertions must be awaited (`await expect(p).resolves.…`). This is enforced by **`@typescript-eslint/no-floating-promises`**, and only by it: Vitest 4 auto-awaits a pending assertion and merely warns on stderr, so the suite still exits 0, and `no-unused-expressions` never sees the problem since `expect(p).resolves.toBe(x)` ends in a call. Two assertions in `optional.test.ts` had silently never run for exactly that reason. Note the `test/**` override disabling `no-unused-expressions` was dropped for an unrelated reason — Chai's bare member expression `expect(x).to.be.true` is gone.
- Comparing errors: use `thrownBy(...)` with `toBe` whenever the *identity* of an object is the contract — a returned `Result` that must be the receiver itself, an `Error` handed to a callback, the failure `merge` picks. `toStrictEqual` compares `Error`s by message and `toThrow` does too, so both accept a look-alike copy.
- Tests that exercise the Promise helpers must load the extension with a **static** side-effect import (`import '../src/result-promise-extension'`), never a floating `import(...)` — the dynamic form resolves too late and the prototype patch isn't applied when the test runs.
