# SnowMobile

Custom CSS that makes the Snowheads.com forum easier to use on mobile devices.
The `css/` files are the source of truth. The project builds them into a userscript
for iPhone; `manifest.json` is only a quick local development loader for desktop.

## Test and develop locally

Load this project as an unpacked extension once:

- **Chrome:** open `chrome://extensions`, enable **Developer mode**, click
  **Load unpacked**, and select the project folder.
- **Firefox:** open `about:debugging#/runtime/this-firefox`, click **Load Temporary
  Add-on…**, and select this folder's `manifest.json`.

Open Snowheads. Edit the relevant file in `css/`, then reload the Snowheads tab to
see your changes. If the browser still shows the old CSS, reload the extension from
its extensions page and refresh the tab again.

### Live feedback in Safari on macOS

For testing the userscript in Safari itself, install the local development
userscript once:

```bash
yarn install
yarn dev:safari
```

While that command is running, add
`http://127.0.0.1:4173/snowmobile.local.user.js` in Userscripts' **New Remote**
option and accept the install prompt. Enable Userscripts for Snowheads, disable
the published SnowMobile script to avoid overlapping styles, then open or refresh
a Snowheads page. Keep the command running and edit files in `css/`: the matching
stylesheet is fetched from your working tree. Within about a second, Safari reloads
the page once for each saved CSS revision and reinjects it using the same
`GM_addStyle`/`GM.addStyle` API as the production userscript; the current scroll
position is restored. The Safari Web Inspector console logs applied revisions.
The generated local script is in the ignored `dist/` directory. It does not use
`@updateURL`; CSS live reload works independently of Userscripts' update checker.
Reinstall it from **New Remote** only when the loader code changes. Set `PORT` if
4173 is already in use, for example `PORT=4174 yarn dev:safari` (use that port in
the Userscripts install URL too).

The dev server listens only on this Mac's loopback interface. If it is stopped,
the local userscript reports a connection warning in the Web Inspector console;
it reconnects automatically when the server starts again.

Run the fast route-mapping checks with `yarn test`.

For an iPhone-sized screenshot, install dependencies and run:

```bash
yarn install
yarn screenshot:iphone16e
```

The screenshot tool drives Playwright **WebKit** (the Safari engine) with an
iPhone device profile, so the result matches a real iPhone rather than a desktop
Chromium window squeezed to phone width. It injects the source CSS directly and
defaults to 390×844 (iPhone 16e) at DPR 3 with touch enabled.

On Linux, Playwright's WebKit is an Ubuntu build, so it needs a few Ubuntu
libraries that Fedora does not ship. Fetch and install them once (no root
required):

```bash
yarn webkit:install-deps
```

Useful overrides:

- `DEVICE="iPhone 16 Pro Max"` (or any Playwright device name) to change phone.
- `ENGINE=chromium` to capture with Chromium instead of WebKit.
- `VIEWPORT_WIDTH` / `VIEWPORT_HEIGHT` to override just the viewport size.
- `HEADLESS=false` to watch the run. The tool reuses a persistent Playwright
  profile per engine, so the login session is preserved.
- `CHROMIUM_PATH` if Chromium is installed at a different path on your system.

The tool prints the layout `innerWidth`, DPR, touch support and page
`scrollWidth`, and warns about horizontal overflow.

### look → change → verify loop

`scripts/visual-review.js` drives Chromium with the unpacked extension actually
loaded (via `--load-extension`), so a capture reflects what the browser's
manifest content scripts really apply — not an injected copy of the CSS. It
captures a 390×844 phone viewport at DPR 3 and can diff two captures.

```bash
yarn review --route viewtopic            # LOOK: capture the page
# edit a file in css/
yarn review --route viewtopic            # CHANGE: capture again
yarn review:verify --route viewtopic     # VERIFY: diff against the baseline
```

Save a clean baseline first (one per route), then diff later captures against it:

```bash
yarn review:baseline --route viewtopic
```

Routes match the manifest content scripts: `viewtopic`, `forumlist`, `start`,
`viewforum`. Pass `--url <url>` for anything else.

Useful flags:

- `--route <name>` / `--url <url>` choose the page.
- `--full` captures the whole page instead of the phone viewport.
- `--no-ext` launches without the extension, to prove its effect by diffing.
- `--baseline <png>` diffs against an explicit image; `--json` is scriptable.
- `DIFF_TOLERANCE` (default 16, per 0–255 channel) absorbs capture noise.

The run prints the CSS route and content hash it captured against, warns if the
page has horizontal overflow, and reports the number and percentage of changed
pixels plus a red-highlighted diff image. Captures and diffs live under
`/tmp/opencode/snowmobile-screenshots/loop/`.

The tool reuses the login session in `~/.local/share/snowmobile-playwright`
(override with `SNOWMOBILE_PROFILE`), and expects Fedora's Chromium at
`/usr/bin/chromium-browser` (override with `CHROMIUM_PATH`).

## iPhone (Safari)

Install [Userscripts](https://apps.apple.com/app/userscripts/id1463298887), enable it
in **Settings → Safari → Extensions**, then open this link in Safari:

[Install SnowMobile](https://raw.githubusercontent.com/oferm/snowmobile-webextension/userscript/snowmobile.user.js)

Accept the install prompt. The userscript is published automatically when changes
are pushed to `master`, and Userscripts checks the published metadata for updates.

## Build the userscript

Node.js is required. Build locally with:

```bash
yarn build:userscript
```

The generated files are written to the ignored `dist/` directory. Push changes to
`master` to publish the installable files on the `userscript` branch.
