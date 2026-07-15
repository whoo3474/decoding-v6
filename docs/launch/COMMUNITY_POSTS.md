# Community-specific launch drafts

Check each community's current rules immediately before posting. These are intentionally different posts, not cross-posted copies. Do not post all three on the same day and do not solicit votes.

## r/webdev — architecture and browser UX

**Title:** I built a 47-tool developer workbench where every operation stays in the browser

I rebuilt decod.ing as an Astro static app with Preact islands and dedicated Web Workers. The universal input detects eight format families and follows nested encoding, while 47 focused tools are lazy-loaded by category. There is no login, API decoder, analytics SDK, AI endpoint, or ad request.

I am looking for concrete feedback on keyboard navigation, responsive layout, format ambiguity, and whether the locale selector and Japanese UI read naturally. Source and threat model are public. Please test only with synthetic payloads.

## r/devops — incident workflow

**Title:** Local-only JWT, timestamp, cron, certificate, diff, and conversion tools for incident work

During incident work I did not want tokens, certificates, query strings, or customer-shaped JSON going to a utility server. decod.ing runs its detector and 47 operations locally, exposes explicit safety limits, and keeps recent history as tool IDs only. The CLI accepts stdin or `--file`; positional secret-like blobs are intentionally unsupported.

I would value feedback on the fastest synthetic troubleshooting tasks to include in a ten-minute beta and on missing deterministic checks. Do not paste production tokens, private keys, or customer data.

## r/netsec — threat model and verification boundary

**Title:** Security review request: a local decoder that refuses to call decoding proof

decod.ing distinguishes format detection from trust. A parsed JWT is not presented as a verified signature; X.509 trust and revocation are not claimed. Preview operations run in a sandbox with scripts, forms, navigation, downloads, and network blocked. Parser input, recursive depth, node count, output size, compression ratio, and runtime are bounded.

The threat model, CSP, dependency record, public fixtures, and privacy-canary tests are in the repository. I am looking for review of boundary mistakes, confusing claims, and synthetic adversarial fixtures—never real secrets or customer payloads.
