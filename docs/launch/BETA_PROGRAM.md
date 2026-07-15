# Synthetic beta program

Goal: recruit 10 developers, SREs, or security practitioners and measure whether at least 8 can complete their first task within 10 seconds without exposing sensitive data.

## Participant safety

- Use only the synthetic values below or self-created dummy data.
- Never paste production JWTs, cookies, API keys, private keys, certificates, customer payloads, internal URLs, or file names.
- Do not screen-share unrelated tabs, consoles, or clipboard managers.
- Feedback should contain tool IDs, expected format, elapsed time bucket, and a description—not the original payload.

## Five-minute task set

1. Decode `eyJsb2NhbCI6dHJ1ZSwidG9vbHMiOjQ3fQ==` and identify the nested format.
2. Open JSON Format / Validate and format `{"answer":42,"local":true}`.
3. Inspect synthetic JWT `eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJleGFtcGxlIn0.` and explain the warning.
4. Find one tool using keyboard search and favorite it.
5. Switch to another supported language if you can review its technical terminology.

## Evidence record

For each participant record only:

- role bucket: developer / SRE / security / other
- device class and browser family
- locale tested
- first task: completed yes/no and `<10s`, `10–30s`, or `>30s`
- tool IDs used
- confusion category and suggested change
- permission to quote an anonymized sentence

No user account, email address, payload, exact URL, IP address, fingerprint, or persistent participant identifier belongs in the product.

## Recruitment text

> I am looking for developers/SREs/security practitioners to test a no-account local decoder for five minutes using synthetic data only. The app sends no payloads and the source is public. I need task-time and terminology feedback, especially for Japanese, Korean, Simplified Chinese, Spanish, Brazilian Portuguese, German, and French. Reply on the public beta issue without including any real token or customer data.
