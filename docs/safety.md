# Safety and responsible use

Scripts executed in the DevTools Console can read and modify page content and can operate within your authenticated browser session. Treat them with the same care as software you install.

## Before running a utility

- Read its entire source code and script-specific README.
- Check that the target website and active account are correct.
- Use scripts only on accounts and content you own or are authorized to manage.
- Back up valuable data before any irreversible change.
- Check website terms, user rights, rate limits, and relevant policies.
- Understand all prompts and the effect of the script's final confirmation.
- Prefer small trial batches for scripts that change or delete data.
- Never paste untrusted snippets just because someone asks you to do so.

## Standards for scripts in this repository

Scripts should:

- Have an explicit IIFE wrapper and `"use strict"`.
- Make the target domain or webpage obvious, and refuse to run outside that scope when practical.
- Clearly document configuration and side effects.
- Ask for confirmation before destructive or externally visible bulk actions.
- Provide observable progress and a reasonable stopping mechanism for long-running work.
- Fail visibly when expected UI elements, responses, or conditions are missing.
- Avoid hidden network requests, obfuscated code, third-party telemetry, and embedded credentials.
- Minimize the information read from or written to the page.
- Make no claims of being officially endorsed by the target site.

## Platform-specific limitations

Website interfaces are not stable APIs. UI selectors, authentication flows, dialogs, locale strings, lazy loading, and security rules can change without notice. Automated interactions may fail or result in rate limits, challenges, or account restrictions. Timing delays do not eliminate these risks.

## Responsibility

Utilities are offered as-is for authorized, informed use. The repository does not guarantee outcomes, compatibility, undo support, or the absence of data loss. Verify important changes through the site's normal interface.
