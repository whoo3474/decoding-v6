# Cloudflare PR previews

Every same-repository pull request builds the static web app and uploads an immutable Worker version with alias `pr-<number>`. The workflow updates one pull-request comment instead of creating duplicate comments.

## Repository configuration

- Actions variable `CLOUDFLARE_ACCOUNT_ID`
- Actions variable `CLOUDFLARE_WORKERS_SUBDOMAIN`
- Actions secret `CLOUDFLARE_API_TOKEN`

The token must be a dedicated, revocable Cloudflare API token with only the account and Workers Scripts permissions needed by Wrangler. A local interactive OAuth token must not be copied into GitHub because it expires and grants a broader user session.

Fork pull requests do not receive credentials and therefore do not run the preview job. Production routes are never changed by this workflow; production deployment remains an explicit separate action.

Local verification:

```sh
pnpm --filter @decoding/web build
pnpm exec wrangler versions upload --env="" --preview-alias local-check
```
