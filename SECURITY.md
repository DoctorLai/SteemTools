# Security Policy

## Supported versions

The latest published version of Steem Tools receives security updates. Please make
sure you are running the newest release before reporting an issue.

## Reporting a vulnerability

If you discover a security vulnerability, please **do not** open a public issue.
Instead, report it privately:

- Preferred: open a [GitHub security advisory](https://github.com/DoctorLai/SteemTools/security/advisories/new).
- Alternatively, email the maintainer at **dr.zhihua.lai@gmail.com**.

Please include:

- A description of the vulnerability and its impact.
- Steps to reproduce or a proof of concept.
- Any suggested remediation, if you have one.

You can expect an acknowledgement of your report, and we will keep you updated on
the progress toward a fix. Thank you for helping keep Steem Tools and its users
safe.

## Handling of keys and secrets

Steem Tools can broadcast transactions that require a private posting or active
key. Keys are only ever used locally in your browser to sign operations and are
stored using Chrome's `storage.sync` **only** when you explicitly tick _Save Key_.
The project never transmits your keys to any third-party server. See
[PRIVACY.md](PRIVACY.md) for details.
