# Cloudflare deployment evidence

Updated: 2026-07-15 (Asia/Seoul)

## Active endpoints

| Surface          | URL                                                  | Worker                | Version                                | Result |
| ---------------- | ---------------------------------------------------- | --------------------- | -------------------------------------- | ------ |
| Production       | <https://decod.ing>                                  | `decoding-v6`         | `65608571-01c1-4746-989e-7de0dd3b554f` | active |
| Production alias | <https://www.decod.ing>                              | `decoding-v6`         | same deployment                        | active |
| Workers fallback | <https://decoding-v6.wjstks3474.workers.dev>         | `decoding-v6`         | same deployment                        | active |
| Staging          | <https://decoding-v6-staging.wjstks3474.workers.dev> | `decoding-v6-staging` | `ae7932de-ff68-4d00-974d-ca87adde05ff` | active |

The existing proxied DNS records were preserved. The former v3 frontend routes for `decod.ing/*` and `www.decod.ing/*` were atomically reassigned to `decoding-v6`. The separate `api.decod.ing/*` and `staging.decod.ing/*` routes were not changed.

## External verification

`pnpm verify:deploy -- <url>` launches a clean headless Chromium session against the deployed origin. It passed on staging, the Workers production fallback, and `https://decod.ing` with:

- nested Base64 → JSON automatic detection
- exactly 47 searchable tools
- JSON formatter execution in the local worker
- zero request or browser-storage occurrence of a synthetic secret canary
- zero request origin outside the tested site

HTTP checks also confirmed 200 responses for the home, catalog, workspace, operation, and detector routes; a product 404 for a missing route; immutable fingerprinted assets; and CSP, Permissions Policy, Referrer Policy, frame denial, and MIME sniffing protection.

## Rollback drill

The staging Worker was rolled back from `ae7932de-ff68-4d00-974d-ca87adde05ff` to previous version `66bf1109-cee4-4ee2-8fa0-491fde74c0ce`. The external Chromium deployment verification passed on the rolled-back version. Staging was then restored to `ae7932de-ff68-4d00-974d-ca87adde05ff` at 100% traffic and the same verification passed again.

No database, KV, Worker main handler, authentication, payment, analytics, or server-side decode binding exists in either deployment.
