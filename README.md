# SnowMobile

Custom CSS that makes the Snowheads.com forum easier to use on mobile devices.
The `css/` files are the source of truth. The project builds them into a userscript
for iPhone; `manifest.json` is only a quick local development loader for desktop.

## Test and develop locally (Linux)

Load this project as an unpacked extension once:

- **Chrome:** open `chrome://extensions`, enable **Developer mode**, click
  **Load unpacked**, and select the project folder.
- **Firefox:** open `about:debugging#/runtime/this-firefox`, click **Load Temporary
  Add-on…**, and select this folder's `manifest.json`.

Open Snowheads. Edit the relevant file in `css/`, then reload the Snowheads tab to
see your changes. If the browser still shows the old CSS, reload the extension from
its extensions page and refresh the tab again.

For an iPhone-sized screenshot, install dependencies and run:

```bash
yarn install
yarn screenshot:iphone17e
```

The screenshot tool injects the source CSS directly into Chromium at 390×844. Set
`CHROMIUM_PATH` if Chromium is installed at a different path on your Linux system.

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
