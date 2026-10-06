# Project Notes

- User prefers short, concise answers.
- The user tests on an iPhone 16e. Screenshots should use the `iPhone 16e`
  Playwright device profile in WebKit to match that device.
- For visual UI alignment, validate the rendered screenshot directly; DOM bounding boxes alone are insufficient because inline containers and transparent image padding can mislead.
- The release command excludes Playwright files and project metadata. Screenshots are saved outside the project in `/tmp/opencode/snowmobile-screenshots/`.
- The screenshot command reuses the local Playwright profile, so its login session is preserved.
- For visual CSS work, use the look → change → verify loop in
  `scripts/visual-review.js`: capture before editing, change CSS, recapture,
  compare with `yarn review:verify`, and inspect both screenshots/diff directly.
  Use `yarn review:baseline` to intentionally set a new clean baseline. The
  script loads the extension into Fedora Chromium; baseline/current/diff images
  go to `/tmp/opencode/snowmobile-screenshots/loop/`.
- Do not trust ImageMagick's `AE` metric on this machine (7.1.2 beta reports
  error sums, not pixel counts); the loop counts changed pixels from raw RGBA.
