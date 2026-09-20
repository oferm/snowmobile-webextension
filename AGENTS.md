# Project Notes

- User prefers short, concise answers.
- For visual UI alignment, validate the rendered screenshot directly; DOM bounding boxes alone are insufficient because inline containers and transparent image padding can mislead.
- The release command excludes Playwright files and project metadata. Screenshots are saved outside the project in `/tmp/opencode/snowmobile-screenshots/`.
- The screenshot command reuses the local Playwright profile, so its login session is preserved.
