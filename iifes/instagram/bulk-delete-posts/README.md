# Instagram Bulk Post Deleter

A standalone browser-console IIFE that automates deletion of posts and reels from an Instagram profile's visible grid.

> [!CAUTION]
> **High-risk, destructive operation.** Use only with a profile you own or have permission to manage. Back up the content you need first. This script interacts with Instagram's website and may stop working after a UI change. It has not been validated through an end-to-end live deletion test.

## Intended behavior

1. Verify the page is the profile root matching the configured `username`.
2. Read the profile-grid items in DOM order and save the URLs of the **first five** (configurable) as protected.
3. Show those protected URLs in the Console and require an explicit browser confirmation.
4. Open each remaining discovered item.
5. Click **More options**, choose **Delete**, and click **Delete** again in the confirmation dialog.
6. Wait for the dialog to close and the item to disappear from the profile grid before recording it as deleted.
7. Pause between deletions and scroll the profile to discover additional posts.
8. Stop when no more items are found, the configured deletion limit is reached, a problem occurs, or the user requests a stop.

**Preservation means the first five items in the grid when the script starts—not necessarily the five most recent by date.** Pinned posts, reels, and profile sorting affect that order. The protected URLs do not change as other items are deleted.

## Script

[`index.iife.js`](index.iife.js)

The provided source uses `CONFIG.username = "archanafineart_"`. **Change this to the username of your own Instagram account before executing it.** Open `https://www.instagram.com/<your-username>/` and make sure the script and profile URLs match exactly.

## Configuration

| Setting | Default | Meaning |
| --- | --- | --- |
| `username` | `"archanafineart_"` | Instagram profile that the script is allowed to operate on |
| `keepFirst` | `5` | Initial profile-grid items whose URLs are protected |
| `maxDeletions` | `Infinity` | Maximum deletions attempted in one session; change to `1` for an initial trial |
| `minDelayMs` | `4500` | Minimum pause after a successful deletion, in milliseconds |
| `maxDelayMs` | `7000` | Maximum pause after a successful deletion, in milliseconds |
| `waitTimeoutMs` | `20000` | Timeout when waiting for expected UI events |
| `scrollWaitMs` | `1800` | Pause after scrolling to load additional items |
| `maxEmptyScrolls` | `5` | Consecutive scroll attempts without discovering a new grid item before stopping |

`maxDeletions` counts the script's recorded successful deletions. It is not a guarantee of a fixed number of server-side deletions.

## Run in Google Chrome or Microsoft Edge

1. Review and, if necessary, edit `CONFIG.username` and `maxDeletions` in the JavaScript file.
2. Sign in to the target Instagram account and open its **profile grid root**.
3. Open DevTools Console with **`Ctrl+Shift+J`** (Windows/Linux) or **`Command+Option+J`** (macOS).
4. Copy the complete contents of `index.iife.js` into the Console and press `Enter`.
5. Compare the **five protected URLs** listed in the Console with the items you intend to keep.
6. Click **OK** in the browser confirmation dialog only if those protected URLs are correct.
7. Monitor the Console and periodically confirm the results in the Instagram interface.

If the browser displays a warning about pasting into DevTools, review the script independently. Do not bypass the warning for code you have not understood.

## Commands

```js
IGPostCleaner.status(); // Read the state of the current run.
IGPostCleaner.stop();   // Ask the script to stop processing further posts.
```

The stop request is cooperative; it does not undo already initiated or completed deletions. State is kept in the current page session and is lost on reload.

## Known limitations

- Works with Instagram's **current page markup** matching the provided selectors; the website may change.
- Works with the **configured profile only**, not arbitrary usernames without updating `CONFIG.username`.
- The script considers both `/p/` posts and `/reel/` links present in the profile grid.
- The script uses only the loaded browser DOM to discover posts; lazy loading and DOM virtualization can affect discovery and verification.
- It is not an official bulk deletion feature or API and does not guarantee that every post can be deleted.
- It does not store durable checkpoints between page reloads. On restart, review the five newly identified protected items and the actual remaining post order before confirming.
- Platform limits, login challenges, language changes, or unexpected dialogs may interrupt execution.
- A UI disappearance check is not definitive proof of server-side deletion; verify the account afterward.

The script intentionally stops rather than ignoring unexpected interface states. To test more cautiously, configure `maxDeletions: 1` and manually verify that single deletion before allowing larger batches.

## Data handling

The script contains no explicit network requests, third-party endpoints, tracking libraries, or credential collection. It interacts with the Instagram interface through DOM queries and clicks. The Instagram website itself may send network requests as a consequence of those clicks.

For general precautions, read [Safety](../../../docs/safety.md).
