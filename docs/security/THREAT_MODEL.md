# Threat model

Updated: 2026-07-15

## Assets and promises

The primary protected asset is the user's pasted, dropped, opened, or explicitly clipboard-read payload. The product promise is that decoding and utility execution remain on the device and that raw input is not persisted by default. Secondary assets are the integrity of decoded output, workspace redaction, downloadable native artifacts, and the static deployment supply chain.

## Trust boundaries

```text
untrusted input
  -> size/type gate
  -> dedicated browser/native worker
  -> deterministic engine or lazy operation runtime
  -> rendered text/tree or sandboxed preview

explicit save
  -> structural redaction
  -> IndexedDB with selected TTL

static origin
  -> fingerprinted JS/CSS/worker assets
  -> no decode API, account, database, analytics, ad, or payment service
```

The browser, PWA, CLI, desktop, and extension share deterministic packages but have different capability boundaries. Desktop native commands are allowlisted. The extension has no host permission. HTML preview is a sandboxed `srcdoc` with a no-network CSP.

## Threats and controls

| Threat                                            | Control                                                                                                          | Verification                                                   |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Input exfiltration                                | no payload network primitive; `connect-src 'self'`; no analytics or ads                                          | synthetic canary request audit locally and on deployed origins |
| Accidental raw history                            | no default history; redacted-only opt-in workspace; scalar removal; TTL/delete/clear                             | IndexedDB canary absence E2E                                   |
| Decompression bomb or recursive denial of service | 10 MiB input, 32 MiB expanded, 100:1 ratio, 2 s CPU, depth 8, node 64, cycle digest                              | engine limits and fixture tests                                |
| Parser execution or XSS                           | text rendering, parser-specific malicious fixtures, sandboxed HTML preview, CSP, no template/PHP execution       | operation tests and browser sandbox assertions                 |
| Ambiguous or misleading decode                    | confidence evidence, 0.85 auto threshold, 0.15 margin, candidate chooser, Wrong format flow                      | cross-negative fixtures and E2E                                |
| JWT trust confusion                               | signatures are never presented as verified; deterministic algorithm/time warnings                                | engine tests and methodology copy                              |
| Extension overreach                               | `contextMenus`, `activeTab`, `storage` only; no host permissions; session-redacted result                        | manifest and network audit                                     |
| Desktop privilege expansion                       | no shell, unrestricted filesystem, HTTP, SQL, or continuous clipboard capability; clipboard is explicit one-shot | Tauri capability validation                                    |
| Update or installer tampering                     | signed updater metadata, external private key, published checksum plan; public download disabled until notarized | local signature/checksum checks                                |
| Supply-chain drift                                | lockfile, dependency record, network allowlist, license/security review, CI build                                | `pnpm verify`                                                  |
| Static-origin compromise                          | restrictive response headers, immutable assets, rollbackable versions, minimal Worker bindings                   | external HTTP checks and rollback drill                        |

## Residual risks

- Browser extensions, compromised operating systems, clipboard managers, and user-installed root certificates are outside the application boundary.
- Formatting and parser dependencies can contain vulnerabilities even when network access is absent; dependency review and fixture fuzzing remain recurring work.
- `script-src 'unsafe-inline'` is currently required for Astro's generated island bootstrap. External scripts remain forbidden and `connect-src` remains same-origin. Moving the bootstrap to stable external modules or generated CSP hashes would reduce this residual risk.
- Ad, analytics, locale, native store, and updater endpoints require a new threat-model review before activation.

## Incident response

Disable the affected route or surface, roll Cloudflare traffic back to the last verified version, remove any suspect native download, preserve non-payload logs, publish a security advisory, and add a synthetic regression fixture. Real customer payloads must never be requested in an issue.
