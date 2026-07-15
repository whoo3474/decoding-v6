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
- [x] connect GitHub CI and confirm the first [hosted run](https://github.com/whoo3474/decoding-v6/actions/runs/29361506397)
- [ ] independent blind fixture review
- [ ] Apple-notarized universal desktop beta before enabling download

## Communication

- [x] capture a short non-sensitive [product demo GIF](./decoding-demo.gif)
- [x] prepare [Show HN post](./SHOW_HN.md) with local-only disclosure and technical architecture
- [x] prepare distinct [r/webdev, r/devops, and r/netsec drafts](./COMMUNITY_POSTS.md); posting remains pending current-rule and account checks
- [ ] connect Search Console and submit the generated sitemap
- [x] publish the [synthetic beta program](./BETA_PROGRAM.md) and [public recruitment issue](https://github.com/whoo3474/decoding-v6/issues/1); 10 real participants remain pending

## Privacy and support

- [x] public privacy page states storage and network boundaries
- [x] no account, payment, server decode, generative AI, product telemetry, or ad code
- [x] issue template forbids real tokens, credentials, private keys, and customer payloads
- [x] deployed synthetic secret appears in neither requests nor browser storage
- [x] enable GitHub Private Vulnerability Reporting and publish the response schedule in `SECURITY.md`

Launch communication and monetization metrics remain evidence gates; deployment alone does not mark them complete.
