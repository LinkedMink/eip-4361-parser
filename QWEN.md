# @linkedmink/eip-4361-parser

## Project Overview

A TypeScript library for handling **EIP-4361 (Sign-In with Ethereum)** messages on both client and server. It provides:

- **Parsing** ABNF-formatted SIWE messages into structured objects
- **Verification** of message signatures against the signer's Ethereum address
- **Message creation** helpers (`create-message.ts`, `create-browser-message.ts`)
- **Message formatting** (`format-message.ts`)
- **Zod schema integration** for runtime validation (`src/zod/`)

Built on top of `apg-lite` for ABNF grammar parsing, with optional Zod peer dependency for schema validation. Publishes a single ESM output targeting Node.js 20+.

## Architecture

```
src/
├── index.ts                  # Main entry — re-exports core API
├── eip4361/
│   ├── constants.ts          # SIWE domain/nonce URI constants
│   ├── create-message.ts     # Build raw SIWE statement
│   ├── create-browser-message.ts  # Browser-friendly message builder
│   ├── format-message.ts     # Format structured data → ABNF string
│   ├── parse-message.ts      # Parse ABNF string → typed object
│   ├── verify-message.ts     # Cryptographic signature verification (ethers)
│   ├── eip4361-types.ts      # Core TypeScript types/interfaces
│   └── errors.ts             # Custom error classes
├── grammar/
│   └── eip4361.d.ts          # Generated type declarations from ABNF grammar
├── types/
│   └── apg-lite.d.ts         # Type shim for apg-lite
└── zod/
    ├── index.ts              # Zod entry re-export
    ├── zod-schema.ts         # Zod schema definitions (excluded from coverage)
    ├── zod-transform.ts      # Transform helpers
    └── zod-types.ts          # Zod-specific type exports
```

The ABNF grammar file (`src/grammar/eip4361.abnf`) is compiled by `apg-js` during `prebuild` into `src/grammar/eip4361.js`.

## Building and Running

| Command                                                | Description                                                                      |
| ------------------------------------------------------ | -------------------------------------------------------------------------------- |
| `npm run build`                                        | Full build: prebuild (ABNF → JS), then TypeScript compile                        |
| `npm run lint`                                         | ESLint on `src/` and test files                                                  |
| `npm run test`                                         | Jest with watch mode                                                             |
| `npm run test:ci`                                      | Jest headless with coverage report                                               |
| `npx jest <pattern> --no-coverage --reporters default` | Run specific tests without coverage, using the default reporter (cleaner output) |
| `npm run clean`                                        | Remove `dist/` and `coverage/` directories                                       |

**Build output:** Single ESM bundle to `dist/`. Types land in `dist/*.d.ts`.

**Test reporting:** Always use `--reporters default` with direct `npx jest` invocations for cleaner, more readable test output (no Jest summary footer). This is the recommended pattern for development.

## Development Conventions

- **TypeScript strict mode** extending `@tsconfig/node24`
- **SWC for Jest transforms** — not ts-jest (faster CI)
- **Unit test format** suites exist in `test/` with the same relative path and base filename from `src/` as the file they test. `describe` descriptions have the name of the function or class being tested or the filename for modules with collections of loosely functions. `test` descriptions follow the format "should <action-performed-and-or-returned-result> when <input-and-or-scenario>"
- **ESLint v10** with flat config (`eslint.config.js`)
- **Husky + lint-staged** for pre-commit hooks
- **npm `.npmrc`**: auto-tags git tags with `chore: release version %s`
- **Exports map** supports both `.` (core) and `./zod` subpath entry points
- **Peer deps**: `ethers >= 6.13.0` (required), `zod >= 4.0.0` (optional)
- **Node target**: Node 20+

## Key Notes for AI Assistance

- **Do NOT update `@types/node`** — its major version must match the Node.js target (24.x, per `@tsconfig/node24`) to avoid type errors for standard library APIs.
- **Do NOT update `typescript` to 7.x** — `typescript-eslint` 8.x rejects TS 7 at runtime (`npm run lint` fails) and its peer range caps at `<6.1.0`; TS ≥7.1 support is tracked upstream. `jest-mock-extended` peers also cap at `^6.0.0`. Keep `typescript` on 6.x until the toolchain supports 7.
- The `prebuild` step runs `apg-js` to compile `.abnf` → `.js`. If the grammar file changes, ensure the prebuild step is re-run.
- Zod-related source files (`src/zod/zod-schema.ts`) are excluded from coverage thresholds.
- **Testing ESM modules with external deps:** Use `jest.mock("module-name")` with namespace imports (`import * as Mod from "module"`) in the source file to allow Jest to intercept calls. Access auto-mocked properties via `jest.mocked(Mod)`, and use `mock<T>()` from `jest-mock-extended` to construct auto-mocked instances of interfaces (e.g., `mock<SomeInterface>()` returns an instance with all methods as `jest.Mock`).
