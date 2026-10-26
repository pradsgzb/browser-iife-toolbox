# Contributing

Thank you for improving the Browser IIFE Toolbox.

## Adding a utility

1. Create a descriptive folder under `iifes/<website-or-category>/<action>/`.
2. Save the standalone code as `index.iife.js`.
3. Add a nearby `README.md` documenting its purpose, supported URLs, prerequisites, configuration, steps to run, stopping behavior, side effects, and limitations.
4. Add the new utility to the catalog in the root `README.md`.
5. Run `node --check` against the script before submitting a pull request.

Start from [`templates/iife.template.js`](templates/iife.template.js) when useful.

## Source code requirements

- Wrap browser-console code in an IIFE and use strict mode.
- Prefer semantic selectors, stable attributes, and precise scoping over brittle generated CSS classes.
- Do not include passwords, API keys, access tokens, personal information, or login cookies.
- Do not submit minified or intentionally obfuscated scripts.
- Do not silently exfiltrate data or run hidden third-party code.
- Validate page and account context before changing anything.
- Show warnings and obtain explicit confirmation for destructive operations.
- Include adequate status logging, controlled failure handling, and a stop mechanism where useful.
- Never claim live test coverage without actual evidence.

## Commit style

Use a concise subject in the form `type: summary`, such as:

- `feat: add Instagram bulk post deletion IIFE`
- `docs: clarify Chrome and Edge execution steps`
- `fix: handle changed confirmation dialog markup`
- `chore: improve JavaScript syntax checks`

## Reporting bugs

Include the script path, browser and version, a redacted error message, and steps to reproduce. **Never include passwords, session tokens, login cookies, or personal data** in public issues.

Before publishing the repository for unrestricted reuse or taking outside contributions, its owner should choose and include an explicit open-source license.
