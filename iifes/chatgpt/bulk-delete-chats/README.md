# ChatGPT Sidebar Bulk Chat Deleter

A browser-console IIFE that processes currently loaded conversations in the ChatGPT web sidebar, using the conversation **options → Delete → confirmation** flow.

> [!CAUTION]
> **Destructive.** Deleted ChatGPT conversations cannot be recovered. Export any content you want to retain before proceeding.

> [!TIP]
> **Prefer ChatGPT's built-in bulk action** when your goal is to remove *all* chats: in ChatGPT, open **Settings → Data controls → Delete all chats**. This script is an alternative UI automation experiment and is not needed for the native bulk action. See the [official ChatGPT deletion help](https://help.openai.com/en/articles/8809935-how-to-delete-and-archive-chats-in-chatgpt).

## Source

[`index.iife.js`](index.iife.js)

## Supported page and selectors

- **Website:** `https://chatgpt.com/`
- **Options button:** `button[data-conversation-options-trigger]`
- **Menu item:** `[role="menuitem"]` with the exact text `Delete`, `Delete chat`, or `Delete conversation`.
- **Confirmation:** `button[data-testid="delete-conversation-confirm-button"]`.
- This is DOM automation based on the provided markup; it is **not an official ChatGPT API** and its selectors may change.

## Configuration

| Setting | Default | Meaning |
| --- | --- | --- |
| `dryRun` | `true` | Report currently visible sidebar options buttons without deleting |
| `maxDeletes` | `Infinity` | Maximum UI-confirmed deletions; start with `1` |
| `menuTimeoutMs` | `10000` | Timeout waiting for the Delete menu item |
| `confirmTimeoutMs` | `10000` | Timeout waiting for final confirmation |
| `removalTimeoutMs` | `20000` | Timeout waiting for the selected conversation to leave the DOM |
| `pauseAfterDeleteMs` | `1200` | Delay between deletion flows |

## How to run

1. Sign in to ChatGPT and open its chat-history sidebar on `chatgpt.com`.
2. Press `Ctrl+Shift+J` (Chrome/Edge on Windows/Linux) or `Command+Option+J` (macOS).
3. Review and paste all of `index.iife.js`, then press `Enter`.
4. By default the script performs a **dry run only**.
5. After confirming it recognizes the intended history, set `dryRun: false` and `maxDeletes: 1`, paste the updated source, and type **`DELETE`** to authorize that trial.
6. Check the result manually before attempting a larger batch.

## Stop and status

```js
ChatGPTChatCleaner.status(); // Returns run state and confirmed UI removals.
ChatGPTChatCleaner.stop();   // Requests a cooperative stop.
```

## Changes compared with the originally supplied snippet

- Added **dry-run mode** and explicit typed confirmation.
- Added a deletion limit, status inspection, and cooperative stop.
- Added page validation, bounded UI waits, and fail-closed handling for missing controls.
- Removed the original `optionsBtn.remove()` workaround, which altered the webpage DOM without actually deleting a conversation and could hide an error.
- A removal is counted only after the original chat-options button is no longer connected to the page.

## Limitations

- Only currently loaded and visible conversation controls are processed. Older conversations may load on scrolling; the script may require additional reviewed runs.
- Does not independently enumerate archived chats or prove all chats in the account are deleted.
- Does not guarantee backend data erasure; ChatGPT applies its own deletion and retention policies.
- English menu text is assumed, and the site's markup may change.
- **Verification:** JavaScript syntax checked; **not end-to-end tested against live ChatGPT**.

For general precautions, read [Repository safety](../../../docs/safety.md).
