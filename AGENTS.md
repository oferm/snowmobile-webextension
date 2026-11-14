# Project Notes

- User prefers short, concise answers.
- The user tests on an iPhone 16e. Screenshots should use the `iPhone 16e`
  Playwright device profile in WebKit to match that device.
- For visual UI alignment, validate the rendered screenshot directly; DOM bounding boxes alone are insufficient because inline containers and transparent image padding can mislead.
- The release command excludes Playwright files and project metadata. Screenshots are saved outside the project in `/tmp/opencode/snowmobile-screenshots/`.
- The screenshot command reuses the local Playwright profile, so its login session is preserved.
- For visual CSS work, use the screenshot-driven CSS iteration loop in
  `scripts/visual-review.js`: capture before editing, change CSS, recapture,
  compare with `yarn review:verify`, and inspect both screenshots/diff directly.
  Use `yarn review:baseline` to intentionally set a new clean baseline. The
  script loads the extension into Fedora Chromium; baseline/current/diff images
  go to `/tmp/opencode/snowmobile-screenshots/loop/`.
- Do not trust ImageMagick's `AE` metric on this machine (7.1.2 beta reports
  error sums, not pixel counts); the loop counts changed pixels from raw RGBA.
- Playwright tools inject the built userscript (`dist/snowmobile.user.js`),
  the same `<style>` injection the phone uses. Run `yarn check:layout` before
  publishing; real Safari reports land in `dist/reports/` via `yarn dev:safari`.
- Commit messages: use a single-line imperative summary, sentence-cased (capital
  first letter), under ~50 characters, with no Conventional Commits prefixes
  (`feat:`, `fix:`, etc.) and no trailing period (e.g. `Trim redundant and dead
  CSS rules`).
- Cost & subagent workflow (`opencode.jsonc` pins `explore`/`verifier`/`compaction`
  to `gpt-6-luna#low` and `general` to `gpt-6-luna#medium`):
  - Skip spawning subagents when target files are already known; read directly.
  - Use `explore` for open-ended multi-file discovery.
  - Use `verifier` (`.opencode/agents/verifier.md`) to run `yarn test`,
    `yarn check:layout`, and `yarn review:verify` and report concise text results.
  - Give subagents exact paths and desired output format, and resume via
    `sessionID` for follow-up checks instead of spawning fresh sessions.
  - Run text checks (`yarn test`, `yarn check:layout`) before taking or reading
    screenshots, batch related CSS edits before running `yarn review:verify`,
    and check the changed-pixel count and `overflow` flag before loading PNGs.
