# Public launch checklist

Updated: 2026-07-15

## Technical release

- [x] production and staging static deployments active
- [x] custom apex and `www` routes point to v6
- [x] external Chromium operation and privacy-canary verification
- [x] product 404, security headers, cache policy, sitemap, robots, canonical, JSON-LD, and static OG
- [x] rollback to prior staging version and restore current version
- [x] 47 operation routes and 8 detector pages match registries
- [x] offline PWA, CLI, desktop engineering build, and MV3 extension build
- [x] MIT, security policy, contributing guide, fixture issue form, dependency record, and threat model
- [ ] connect GitHub CI and confirm the first hosted run
- [ ] independent blind fixture review
- [ ] Apple-notarized universal desktop beta before enabling download

## Communication

- [x] capture a short non-sensitive [product demo GIF](./decoding-demo.gif)
- [ ] prepare Show HN post with local-only disclosure and technical architecture
- [ ] publish distinct r/webdev, r/devops, and r/netsec posts only when each community has relevant findings
- [ ] connect Search Console and submit the generated sitemap
- [ ] recruit 10 developer/SRE/security beta participants using synthetic tasks only

## Privacy and support

- [x] public privacy page states storage and network boundaries
- [x] no account, payment, server decode, generative AI, product telemetry, or ad code
- [x] issue template forbids real tokens, credentials, private keys, and customer payloads
- [x] deployed synthetic secret appears in neither requests nor browser storage
- [x] enable GitHub Private Vulnerability Reporting and publish the response schedule in `SECURITY.md`

Launch communication and monetization metrics remain evidence gates; deployment alone does not mark them complete.
