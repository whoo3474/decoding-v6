# Google Search Console setup

The site already publishes `https://decod.ing/sitemap-index.xml` and references it from `robots.txt`.

## Owner action

1. Add a Domain property for `decod.ing` in Search Console. This covers all protocols and subdomains.
2. Copy the Google-provided TXT verification value into Cloudflare DNS for the apex domain.
3. After verification, submit `sitemap-index.xml` in the Sitemaps report.
4. Inspect `/`, `/ja/`, `/ja/json-format/`, and one detector URL to confirm the selected canonical matches the page locale.
5. Review country, query, page, and device aggregates weekly. Do not add payload-bearing product telemetry to reproduce Search Console data.

This step requires an authenticated Google account with ownership authority. It cannot be completed from a repository or Cloudflare Workers deployment alone.
