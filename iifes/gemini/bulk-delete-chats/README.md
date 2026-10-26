# Gemini Bulk Chat Deleter (Bottom to Top)

A browser-console IIFE for removing chat conversations displayed in the Google Gemini conversation list, starting with the **bottommost currently visible** action menu button and working upward.

> [!CAUTION]
> **Destructive.** Deleting a chat may not be reversible. Use this only on your own account or an account you are authorized to manage. Export or save anything you need before enabling deletion.

## Source

[`index.iife.js`](index.iife.js)

## Supported page and selector

- **Website:** `https://gemini.google.com/`
- **Chat actions selector:** `[data-test-id="actions-menu-button"]`
- **Delete flow:** open action menu → click the *single visible* `Delete` menu control → click the *single* `Delete` button in the confirmation dialog.
- The script relies on Google's current page markup and English **Delete** button text. It is **not** an official Gemini API integration.

## Safety defaults and configuration

| Setting | Default | Meaning |
| --- | --- | --- |
| `dryRun` | `true` | Preview the number of visible action controls without clicking or deleting anything |
| `maxDeletes` | `Infinity` | Upper limit on UI-confirmed removals; change to `1` for a first live test |
| `uiTimeoutMs` | `10000` | Time to find expected menu and confirmation controls |
| `deleteTimeoutMs` | `20000` | Time allowed for a chat to disappear after confirmation |
| `pauseAfterDeleteMs` | `1800` | Pause between successful deletion flows |

## Running the script

1. Sign in to Gemini and open the conversation history/list with chat action controls available.
2. Open the Console in **Chrome** or **Microsoft Edge** (`Ctrl+Shift+J` on Windows/Linux, `Command+Option+J` on macOS).
3. Review and paste the entire `index.iife.js` source and press `Enter`.
4. The default **dry run** reports how many controls are currently visible and exits without clicking anything.
5. For a controlled trial, edit the code to set `dryRun: false` and `maxDeletes: 1`, then rerun the entire IIFE.
6. Type **`DELETE`** at the prompt to authorize the destructive run. Verify the resulting change manually before increasing the deletion limit.

## Stop and status

```js
GeminiChatCleaner.status(); // Returns current run state and removal count.
GeminiChatCleaner.stop();   // Requests a cooperative stop.
```

The current UI confirmation may already have been submitted when a stop is requested; stopping does not undo deletion.

## Limitations

- Operates only on chats discoverable in the currently rendered list. If older chats load later, more scrolling and another reviewed run may be needed.
- The bottom-to-top order follows the **currently rendered DOM**, not necessarily the absolute chronological order across all chat history.
- The script stops on ambiguous/missing Delete buttons, timeouts, or failure to observe a chat disappear; it does **not** continue guessing.
- UI disappearance is not proof of completed server-side erasure.
- Website layout changes, hidden controls, localization, rate limiting, or changes in how dialogs are rendered may cause it to stop.
- **Verification:** syntax checked; **not tested end to end against a live Gemini session**.

For browser security guidance, read [Repository safety](../../../docs/safety.md).
