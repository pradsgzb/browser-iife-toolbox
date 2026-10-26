# Browser IIFE Toolbox

A curated collection of practical **Immediately Invoked Function Expressions (IIFEs)** for automating repetitive tasks in your browser.

Each utility is a standalone JavaScript snippet designed to run directly in the **Google Chrome** or **Microsoft Edge** Developer Tools Console. No browser extension, package installation, or build process is required.

> [!IMPORTANT]
> **Read the source before running it.** Console scripts execute with the permissions of the currently open website and your signed-in session. Some scripts make changes that cannot be undone. Run them only on accounts and data you own or are authorized to manage, and respect the applicable website's rules and rate limits.

## Available IIFEs

| Utility | Website | Purpose | Default behavior | Risk |
| --- | --- | --- | --- | --- |
| [Instagram Bulk Post Deleter](iifes/instagram/bulk-delete-posts/README.md) | Instagram | Delete profile-grid posts and reels through the visible interface | Preserve first **5** initial grid items | **High — destructive** |
| [Gemini Bulk Chat Deleter](iifes/gemini/bulk-delete-chats/README.md) | Google Gemini | Delete loaded chats in bottom-to-top UI order | **Dry run**; deletion requires an explicit configuration change and typed confirmation | **High — destructive** |
| [ChatGPT Sidebar Bulk Chat Deleter](iifes/chatgpt/bulk-delete-chats/README.md) | ChatGPT | Delete loaded chat-history sidebar conversations | **Dry run**; deletion requires an explicit configuration change and typed confirmation | **High — destructive** |
| [Bulk Image Listing Deleter](iifes/utilities/bulk-delete-image-listings/README.md) | Site-specific (unverified) | Delete image-containing checkbox rows using the page's own Delete confirmation | **Dry run**; previews matching rows | **High — destructive** |

Scripts are organized by website or purpose, with dedicated documentation for each one. **The new Gemini, ChatGPT, and image-listing utilities are preview-only by default.** Their settings must be deliberately changed before they can delete anything. The Instagram utility retains its previously documented behavior and defaults.

## How to run an IIFE

### 1. Open the relevant website

Navigate to the page required by the utility, and sign in if needed. Always check the utility's own README for its exact prerequisites.

### 2. Review and copy the JavaScript source

Open the chosen `index.iife.js` file in this repository. Read the entire script, including its configuration, permitted target website, and any irreversible actions. Copy the source code; **do not paste commands from untrusted websites or messages**.

### 3. Open the browser's Console

| Browser | Windows / Linux | macOS |
| --- | --- | --- |
| **Google Chrome** | `Ctrl + Shift + J` | `Command + Option + J` |
| **Microsoft Edge** | `Ctrl + Shift + J` | `Command + Option + J` |

You can also press `F12` on Windows and select the **Console** tab. If the browser displays a protection warning about pasting, do not bypass it unless you have independently inspected and understood the code.

### 4. Execute and monitor

Paste the *entire* IIFE into the Console and press `Enter`. Review any preview, log output, and confirmation prompt. Keep the tab open for the duration of a long-running script.

For instructions on saving frequently used snippets, see [Running scripts in Chrome and Edge](docs/running-in-browser.md).

## Featured utility: Instagram Bulk Post Deleter

**Source:** [`iifes/instagram/bulk-delete-posts/index.iife.js`](iifes/instagram/bulk-delete-posts/index.iife.js)  
**Details:** [Usage, configuration, safeguards, and limitations](iifes/instagram/bulk-delete-posts/README.md)

This IIFE automates the Instagram web interface to remove posts from a profile, while preserving a configurable number of the first items in the initial profile grid.

**Current defaults:**

- Account: `archanafineart_` (**edit `CONFIG.username` to your own account before use**).
- Preserve the first `5` profile-grid items, based on the original displayed order. This may include posts and reels and is not necessarily chronological, particularly if posts are pinned.
- Delete other discovered posts and reels after a one-time confirmation.
- Scroll to discover additional grid items and use the visible **More options → Delete → Delete** flow.
- Use a randomized `4.5–7` second delay between successful deletions.
- Stop if the script encounters an unexpected dialog, times out, or cannot verify that an item has disappeared from the grid.

The script records the protected five item URLs **before** performing deletions. It does not repeatedly skip whichever five items become first after the grid changes.

### Basic settings

Edit the configuration near the top of the source file:

```js
const CONFIG = Object.freeze({
  username: "archanafineart_", // Change to the account you own.
  keepFirst: 5,                 // Number of initial grid items to protect.
  maxDeletions: Infinity,       // Set to 1 or 2 for a small first run.
  minDelayMs: 4500,
  maxDelayMs: 7000,
  waitTimeoutMs: 20000,
  scrollWaitMs: 1800,
  maxEmptyScrolls: 5,
});
```

**Important:** Run the configured script from the matching profile root URL, for example `https://www.instagram.com/<your-username>/`. The current implementation checks that the username in the URL matches `CONFIG.username`.

### Progress and stopping

After starting the IIFE, use these commands in the *same tab's* Console:

```js
IGPostCleaner.status(); // Status, protected URLs, deleted URLs, last error.
IGPostCleaner.stop();   // Request a stop before processing further items.
```

The stop command cannot restore anything already deleted and may not cancel an operation that has passed its final confirmation. Closing or reloading the tab also interrupts the script, but does not undo completed actions.

### Limitations and safety

- **Deletion is destructive.** Export or back up your Instagram data first, and manually verify results.
- This is browser UI automation, not an official Instagram API client. Interface changes, language differences, unexpected dialogs, lazy loading, or platform restrictions can interrupt it.
- Disappearing from the visible grid is a *UI check*, not proof that server-side deletion has irreversibly completed.
- `maxDeletions: Infinity` does not override platform rate limits, and the included delays do not guarantee avoidance of throttling or account restrictions.
- **Testing:** JavaScript syntax can be checked automatically, but the included utility has **not been end-to-end tested against a live Instagram session** in this repository.

## Additional utilities

### Gemini Bulk Chat Deleter

**Source:** [`iifes/gemini/bulk-delete-chats/index.iife.js`](iifes/gemini/bulk-delete-chats/index.iife.js)  
**Details:** [Configuration, preview mode, confirmation, and limitations](iifes/gemini/bulk-delete-chats/README.md)

This script works through Gemini's conversation action controls and processes the **bottommost visible chat first**. A preview-only mode is enabled by default. For a live run, set `dryRun: false` and start with `maxDeletes: 1`; the script then requires typing `DELETE`. Use `GeminiChatCleaner.stop()` to request a controlled stop. Only chats currently rendered in the web interface can be discovered; this is not guaranteed to cover all account history.

### ChatGPT Sidebar Bulk Chat Deleter

**Source:** [`iifes/chatgpt/bulk-delete-chats/index.iife.js`](iifes/chatgpt/bulk-delete-chats/index.iife.js)  
**Details:** [Usage, preview mode, safety improvements, and limitations](iifes/chatgpt/bulk-delete-chats/README.md)

Automates **Options → Delete → Confirm** for conversations loaded in the ChatGPT sidebar. Runs in preview-only mode unless `dryRun` is changed to `false`, and requires typing `DELETE` for a live run. Use `ChatGPTChatCleaner.stop()` to request a stop.

**If your goal is to remove all ChatGPT conversations, the supported alternative is ChatGPT's built-in Settings → Data controls → Delete all chats.** The IIFE is useful for exploring or adapting UI-driven deletion of visible sidebar entries, not as a guaranteed account-wide deletion mechanism. See [OpenAI's deletion guidance](https://help.openai.com/en/articles/8809935-how-to-delete-and-archive-chats-in-chatgpt).

### Bulk Image Listing Deleter

**Source:** [`iifes/utilities/bulk-delete-image-listings/index.iife.js`](iifes/utilities/bulk-delete-image-listings/index.iife.js)  
**Details:** [Target DOM requirements, configuration, and limitations](iifes/utilities/bulk-delete-image-listings/README.md)

Works with certain **checkbox-based image listing pages** that have a page-level Delete button and a confirmation dialog. It defaults to `dryRun: true`, printing a preview of up to 20 matching rows. It can be stopped with `window.__stopBulkImageDelete()`.

**No specific target website was provided for this script.** Confirm that the page's actual elements match the script before allowing deletion. The utility should not be treated as a universal image deleter.

## Repository layout

```text
browser-iife-toolbox/
├── README.md
├── CONTRIBUTING.md
├── .editorconfig
├── .gitignore
├── iifes/
│   ├── instagram/
│   │   └── bulk-delete-posts/
│   │       ├── index.iife.js
│   │       └── README.md
│   ├── gemini/
│   │   └── bulk-delete-chats/
│   │       ├── index.iife.js
│   │       └── README.md
│   ├── chatgpt/
│   │   └── bulk-delete-chats/
│   │       ├── index.iife.js
│   │       └── README.md
│   ├── utilities/
│   │   └── bulk-delete-image-listings/
│   │       ├── index.iife.js
│   │       └── README.md
│   ├── github/                 # Reserved for future GitHub utilities
│   └── productivity/           # Reserved for future workflow utilities
├── docs/
│   ├── running-in-browser.md
│   └── safety.md
├── templates/
│   └── iife.template.js
└── .github/
    └── workflows/
        └── syntax-check.yml   # Automatically checks all IIFEs
```

### Naming convention

Use `iifes/<website-or-category>/<action>/index.iife.js` and put a `README.md` next to each script. Prefer descriptive, lowercase, hyphenated names. Avoid storing credentials, access tokens, or personal data in committed source code.

## Contributing

Contributions, bug reports, accessibility improvements, and well-documented utilities are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting a pull request. New scripts should be understandable, auditable, and safe by default; destructive scripts must have an explicit confirmation step and clear scope.

## Disclaimer

This is an independent, community-oriented collection of scripts and is not affiliated with or endorsed by Instagram, Meta, Google, OpenAI, Microsoft, or any other website provider. Utilities are provided **as-is**, without any guarantee of continued compatibility, successful completion, or freedom from account restrictions. Review [the safety guidance](docs/safety.md) before use.

**License:** Before publishing or accepting contributions, the repository owner should select and add an explicit open-source license, such as MIT or Apache-2.0. A public GitHub repository does **not** automatically grant reuse rights.
