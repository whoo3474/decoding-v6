# Dependency and network record

Updated: 2026-07-15

| Boundary   | Direct dependency group                                                                 | Purpose                                                      | Runtime network                              |
| ---------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------ | -------------------------------------------- |
| engine     | `fflate`                                                                                | gzip/zlib/deflate decode under engine limits                 | none                                         |
| operations | Prettier parsers, YAML, SQL formatter, diff, cron, QR, hash, X.509                      | local formatter/parser/generator runtimes loaded by category | none                                         |
| web        | Astro, Preact                                                                           | static generation and local islands/workers                  | same-origin static assets only               |
| CLI        | engine, operations, tsup runtime bundle                                                 | stdin/file-only local execution                              | none                                         |
| desktop    | Tauri plugins for explicit clipboard, shortcut, tray, dialog, autostart, signed updater | native shell; updater only after explicit action             | configured update endpoint only after action |
| extension  | engine                                                                                  | selection context menu and session-redacted result           | none; CSP `connect-src 'none'`               |

Production changes must record license, bundle size, parser attack surface, and any destination. `pnpm check:network`, capability validation, privacy E2E, and the extension manifest gate block boundary drift.
