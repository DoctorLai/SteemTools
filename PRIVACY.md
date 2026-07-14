# Privacy Policy

_Last updated: 2026-07-14_

Steem Tools is an open-source browser extension. This document explains what data
the extension handles and where it goes. The source code is available for review in
this repository.

## What the extension stores

Steem Tools stores your preferences using Chrome's `storage.sync` API so they are
available whenever you open the popup. This may include:

- Your Steem account id and any additional ids you add to the _General_ tab.
- Your selected API server and node URLs.
- Steem-JS console snippets you save.
- Wallet form values (amount, memo, recipient list, unit).
- Your private posting/active key — **only if** you explicitly tick _Save Key_.

This data is stored by your browser (and synced to your Google account if Chrome
Sync is enabled). It is **not** sent to the extension author.

When the popup is opened as a **static preview** (for example the GitHub Pages demo)
instead of as the installed extension, these preferences are kept in the page's
`localStorage` on the hosting origin rather than in `storage.sync`. The preview is
for demonstration only — **do not enter real private keys** there.

## Private keys

When you use the wallet or delegation features, your private key is used **locally**
in your browser to sign the transaction, which is then broadcast to a Steem node of
your choice. Your key is never sent to any third-party server operated by the
extension author. If you do not tick _Save Key_, your key is not persisted at all.

We strongly recommend using a dedicated posting key rather than your owner or active
key wherever possible.

## Network requests

To display blockchain and account information, the extension calls public APIs,
including:

- Public Steem RPC nodes (configurable in _Settings_), for example
  `https://api.steemit.com`.
- A Steem Tools helper API operated by the author (`api.justyy.workers.dev`, a
  Cloudflare Worker) to fetch aggregated data such as delegators, downvotes,
  witnesses and deleted comments. These requests include the Steem account id you
  are querying.
- Public avatar/board images (for example `steemitboard.com`).

On supported Steem front-ends, the content script sends the post author and
permlink to a helper API to display the list of resteems.

## What the extension does **not** do

- It does not run any third-party analytics or advertising trackers.
- It does not collect personally identifying information beyond the public Steem
  account ids you choose to query.
- It does not sell or share your data.

## Questions

If you have any questions about this policy, please open an issue on the
[GitHub repository](https://github.com/DoctorLai/SteemTools/issues) or contact the
maintainer at dr.zhihua.lai@gmail.com.
