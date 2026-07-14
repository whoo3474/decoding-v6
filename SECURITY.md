# Security policy

Do not include real secrets or payloads in a public issue. Report ordinary bugs with the smallest synthetic reproduction and the affected detector or operation. Report vulnerabilities privately through [GitHub Private Vulnerability Reporting](https://github.com/whoo3474/decoding-v6/security/advisories/new) before sharing sensitive technical material.

The maintainer target is to acknowledge a private report within three business days, complete initial severity and affected-version triage within seven business days, and post progress at least weekly until resolution. Timelines may shorten for active exploitation. A fix is disclosed only after a verified release or mitigating rollback is available.

The supported v6 line performs decoding locally. Browser and extension builds have no product network primitive; the desktop updater connects only after an explicit **Check now** action. A decoded JWT is not a verified signature, and a decoded X.509 certificate is not a trust or revocation decision.
