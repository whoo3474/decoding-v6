# Show HN draft

## Title

Show HN: decod.ing – 47 local developer tools that never upload your input

## Post

I built <https://decod.ing>, a free universal decoder and 47-tool developer workbench. You can paste a JWT, Base64, JSON, hex, URL, Unix timestamp, UUID/ULID, or compressed file; it detects plausible formats, shows the evidence and competing candidates, and follows nested layers such as Base64 → gzip → JSON.

The privacy boundary is the main product constraint: decoding and tool operations run in dedicated Web Workers, raw input never enters a URL or server request, and there is no account, payment, product telemetry, generative AI, or ad network. The PWA works offline. The CLI contains no network code, and the Tauri desktop shell is available for engineering review while signed public builds are still gated.

The site is statically generated with Astro and served through Cloudflare Workers Static Assets. Heavy parsers are split by operation category and loaded only when selected. The detector uses deterministic syntax, structure, and magic-byte evidence with explicit cycle, size, expansion-ratio, and time limits.

Source: <https://github.com/whoo3474/decoding-v6>

I would especially value feedback on ambiguous format ranking, keyboard flow, technical Japanese terminology, and useful missing local operations. Please use synthetic data only—the issue form explicitly rejects real credentials and customer payloads.

## Posting checks

- Confirm the production URL and repository are reachable while logged out.
- Use the title exactly once and do not ask for upvotes.
- Stay available to answer technical questions after posting.
- Record the post URL and concrete feedback in the launch checklist.
