# snowmobile-webextension
Make the snowheads.com forum mobile friendly.

## About
This is a Firefox WebExtensions add-on that adds custom CSS to the snowheads.com forum,
in order to make it prettier for mobile users.

## Test in Chromium

1. Open `chromium://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select this project directory.
4. Open `https://snowheads.com`.

Reload the extension from `chromium://extensions` after changing files.

## Automated screenshots

Install dependencies with Yarn:

```bash
yarn install
```

Capture the default page at 390×844:

```bash
yarn screenshot
```

The default matches the iPhone 17e CSS viewport (390×844):

```bash
yarn screenshot:iphone17e
```

Use another viewport or URL:

```bash
VIEWPORT_WIDTH=768 VIEWPORT_HEIGHT=1024 yarn screenshot https://snowheads.com/
```

Create a release with:

```bash
yarn release
```

Playwright files and project metadata are excluded from the release. Screenshots are saved outside the project in `/tmp/opencode/snowmobile-screenshots/`.
The screenshot command reuses the local Playwright profile, so its login session is preserved.
