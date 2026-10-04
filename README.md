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

To publish a new GitHub and AMO release in one step, make sure you are
authenticated with GitHub CLI (`gh auth status`), then run:

```bash
yarn publish-release 1.4.0
```

This updates both version files, runs linting, commits and tags the release,
pushes it to GitHub, and publishes the GitHub Release. The AMO workflow then
runs automatically.

Alternatively, Yarn can choose the next semantic version and create the Git
tag for you:

```bash
yarn version --minor   # or --patch / --major
git push --follow-tags
VERSION=$(node -p "require('./package.json').version")
gh release create "v$VERSION" --generate-notes
```

The `version` hook keeps `manifest.json` synchronized with `package.json`.

## Publish releases to AMO

Publishing a GitHub Release automatically runs linting, builds the extension,
and submits it to Mozilla Add-ons (AMO). Configure these repository secrets
before publishing:

- `AMO_JWT_ISSUER`: the AMO API key/issuer
- `AMO_JWT_SECRET`: the AMO API secret

The signed XPI is also attached to the GitHub Release.
