# Bulk Image Listing Deleter

An IIFE for a **checkbox-based image-listing interface**. It selects one currently visible row containing an image, invokes the page's **Delete** action, confirms an **Are you sure** dialog, waits for a progress dialog if present, and continues through the visible or newly scrolled list.

> [!WARNING]
> **Target website not identified.** The uploaded source provides DOM and UI-component selectors but no confirmed website origin. This is **not a generic image deleter** and must not be run against arbitrary web pages. Review the live DOM structure and use the dry run before any destructive operation.

## Source

[`index.iife.js`](index.iife.js)

The code was reconstructed from the supplied Markdown-wrapped JavaScript. Logic and default configuration were preserved; the formatting was normalized so browsers can execute it.

## Required UI structure

- Image listings with `input[type="checkbox"]`, and a meaningful parent row containing an `<img>`.
- A page-level button whose exact visible text is **Delete**, ideally using MUI's `MuiButton-containedError` styling.
- A `[role="dialog"]` confirmation dialog that contains both **Are you sure** and **Delete** text, and an exact **Delete** button.
- Optionally, a progress dialog containing **Deletion in progress**, **Please wait while we delete**, or a progress bar.
- A scrollable list where additional listing rows can become visible.

These selectors are **heuristics** and can select the wrong elements on a different page. The script does not enforce a hostname restriction.

## Configuration

| Setting | Default | Meaning |
| --- | --- | --- |
| `dryRun` | `true` | Preview up to 20 visible matching rows without clicks |
| `maxDeletes` | `Infinity` | Maximum deletions attempted in the session |
| `onlyRowsWithImages` | `true` | Require each matching row to contain an image |
| `stopOnError` | `false` | Continue to another row on some errors; consider `true` for cautious use |
| `allowAlreadySelected` | `false` | Prevent starting if the script detects selected rows |
| `clickDelayMs` | `250` | Delay between some row-selection actions |
| `afterScrollDelayMs` | `800` | Wait for more rows after scrolling |
| `checkboxTimeoutMs` | `8000` | Timeout for checkbox state change |
| `dialogTimeoutMs` | `10000` | Timeout for confirmation controls |
| `loadingAppearTimeoutMs` | `4000` | Optional loading-dialog appearance window |
| `deletionTimeoutMs` | `120000` | Timeout for progress dialog to disappear |
| `rowSettleMs` | `700` | Pause after the delete flow |

## How to run

1. Open the image-listing page and **inspect the checkbox/row/Delete/dialog markup** against the selectors in the script.
2. Ensure no rows are already selected.
3. In Chrome/Edge, open DevTools Console (`Ctrl+Shift+J` on Windows/Linux, `Command+Option+J` on macOS).
4. Paste the complete IIFE. By default it prints a preview table of up to 20 currently visible matched rows and performs **no clicks**.
5. Confirm that every selected row in the preview belongs to the intended listing. For an initial live test, change `dryRun: false`, `maxDeletes: 1`, and preferably `stopOnError: true`.
6. Rerun, type **`DELETE`** at the prompt, and verify the resulting change manually.

## Stop command

```js
window.__stopBulkImageDelete(); // Cooperatively stop the current run.
```

The original source also exposes the flags `window.__bulkImageDeleteRunning` and `window.__bulkImageDeleteStopRequested` for inspecting the current page session.

## Important limitations

- The script's row-detection logic uses ancestors and may not accurately identify rows in all table structures.
- It can continue after some failures because `stopOnError` defaults to `false`.
- It increments its deletion count after the UI confirmation workflow; inability to observe a row disappearing is **not always fatal**. **Counted is not the same as proven deleted.**
- Auto-scroll supports only the discovered scroll container; virtualization and infinite loading may cause incomplete coverage.
- An optional progress dialog can be missed if the action finishes quickly.
- Once final confirmation is clicked, stopping cannot undo that deletion.
- **Verification:** the reconstructed code passes JavaScript syntax validation. **No live website or deletion flow was tested.**

See [Repository safety](../../../docs/safety.md) before running.
