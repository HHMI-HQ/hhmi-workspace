# @hhmi/compliance

## 0.1.3

### Patch Changes

- c017b55: tuned page loading logic
- c017b55: Add a webhook to enable airtable cache warming from a vercel cron

## 0.1.2

### Patch Changes

- 159ea93: Added scopes for initial feature flagged deployment

## 0.1.1

### Patch Changes

- f512935: Enhanced article links and badges are now shown depending on a configuration setting
- 6179c39: Fix normalization during preprint item loading to read from correct field for the related journal article publisher

## 0.1.0

### Minor Changes

- 3a3d63a: Updates for Prisma v7 in line with core platform upgrade, minimum Curvenote Platform version will be v0.14.0

### Patch Changes

- 50f085a: Clicking the compliance issue panel now filters the covered publications listing
- 50f085a: Use a person's name instead of relying on "scientist"
- 50f085a: Added an invite user link to the ShareReportDialog when the investigator has not yet joined the workspace
- 50f085a: Redirect users with the `hhmi-compliance.admin` scope appropriately on qualification and navigation.
- 18588a0: Enable a lab manager to send a request access email direct from the compliance module
- 1bd089d: Show "Resolved" for compliant issues that required action but are now resolved.
- 50f085a: User a schema based format when storing inbound email payloads
- Updated dependencies [50f085a]
- Updated dependencies [3a3d63a]
  - @hhmi/pmc@0.1.0
