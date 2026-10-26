# Running IIFEs in Chrome and Microsoft Edge

IIFEs are JavaScript functions that execute immediately. The scripts in this repository can be pasted into a browser's Developer Tools Console, where they run in the context of the current website and signed-in browser session.

## Browser shortcuts

| Action | Windows / Linux | macOS |
| --- | --- | --- |
| Chrome: open Console | `Ctrl + Shift + J` | `Command + Option + J` |
| Edge: open Console | `Ctrl + Shift + J` | `Command + Option + J` |
| Open DevTools in either browser | `F12` or `Ctrl + Shift + I` | `Command + Option + I` |

Official references: [Chrome DevTools keyboard shortcuts](https://developer.chrome.com/docs/devtools/shortcuts) and [Microsoft Edge DevTools keyboard shortcuts](https://learn.microsoft.com/en-us/microsoft-edge/devtools/shortcuts/).

## Procedure

1. **Open the target webpage.** Check the script-specific README for required URL, account access, and conditions.
2. **Inspect the script.** Read its complete source and edit any configuration values before use.
3. **Open the Console.** Use the shortcut above and ensure the execution context is the intended webpage, not another tab, frame, or extension.
4. **Paste the entire source.** Do not paste only the inner body of the IIFE or the markdown code fences.
5. **Press Enter.** Respond to script prompts only when the requested action is understood and intended.
6. **Monitor progress.** Keep the tab open; do not navigate away or refresh until the run finishes or you deliberately stop it.
7. **Verify the outcome.** For destructive or externally visible actions, confirm the final state on the website itself.

## Browser paste-protection warnings

Modern DevTools may warn or block pasted JavaScript to protect against self-XSS attacks. **Do not bypass a paste-protection warning for unreviewed code.** Confirm the source, permissions, site, and possible side effects before proceeding.

## Keeping scripts for repeated use

Both Chrome and Edge provide **Sources → Snippets** in DevTools in supported versions. Snippets are useful for scripts you run frequently. They execute with the permissions of the target page, so apply the same review and safety precautions as when pasting directly into the Console.

## IIFE basics

```js
(() => {
  "use strict";
  console.log("This script runs immediately.");
})();
```

An IIFE runs once when pasted and evaluated. It can schedule asynchronous operations and may expose explicitly named control functions on `window`. Such controls exist only while the current page session persists.

**Do not assume the scripts are safe just because they are small or open source.** Always review them before execution.
