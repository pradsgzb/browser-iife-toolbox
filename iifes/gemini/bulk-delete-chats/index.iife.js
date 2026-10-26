/**
 * Gemini Bulk Chat Deleter — bottom to top.
 * Run on https://gemini.google.com/ after checking the source and the page.
 * Safety: preview-only by default. Enable deletion explicitly in CONFIG.
 * Console controls: GeminiChatCleaner.status() / GeminiChatCleaner.stop().
 */
(async function geminiBulkDeleteChats() {
  "use strict";

  const CONFIG = Object.freeze({
    dryRun: true,           // Set to false only after reviewing the preview.
    maxDeletes: Infinity,   // Set to 1 for a cautious first live run.
    uiTimeoutMs: 10000,
    deleteTimeoutMs: 20000,
    pauseAfterDeleteMs: 1800,
    pollIntervalMs: 150,
  });
  const PREFIX = "[gemini-bulk-delete]";
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const normalize = (value) => String(value || "").replace(/\s+/g, " ").trim();
  const visible = (el) => {
    if (!el?.isConnected) return false;
    const style = getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden") return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  };

  if (location.hostname !== "gemini.google.com") {
    console.error(PREFIX, "Open gemini.google.com before running this script.");
    return;
  }
  if (window.GeminiChatCleaner?.running) {
    console.warn(PREFIX, "A deletion run is already active.");
    return;
  }

  const state = {
    running: true,
    stopRequested: false,
    deleted: 0,
    lastError: null,
    status() {
      return {
        running: this.running,
        stopRequested: this.stopRequested,
        deleted: this.deleted,
        lastError: this.lastError,
        dryRun: CONFIG.dryRun,
      };
    },
    stop() {
      this.stopRequested = true;
      console.warn(PREFIX, "Stop requested; the current UI operation may still finish.");
    },
  };
  window.GeminiChatCleaner = state;

  function assertRunning() {
    if (state.stopRequested) throw new Error("Stopped by user.");
  }

  async function waitFor(predicate, label, timeoutMs = CONFIG.uiTimeoutMs) {
    const started = Date.now();
    while (Date.now() - started < timeoutMs) {
      assertRunning();
      const found = predicate();
      if (found) return found;
      await sleep(CONFIG.pollIntervalMs);
    }
    throw new Error(`Timed out waiting for ${label}.`);
  }

  function menus() {
    return [...document.querySelectorAll('[data-test-id="actions-menu-button"]')]
      .filter((node) => node.isConnected && visible(node));
  }

  function findMenuDelete() {
    const candidates = [...document.querySelectorAll('button, [role="menuitem"]')]
      .filter((el) => visible(el) && !el.closest('[role="dialog"], mat-dialog-container'))
      .filter((el) => normalize(el.textContent) === "Delete");
    // Do not guess if multiple matching Delete controls are present.
    return candidates.length === 1 ? candidates[0] : null;
  }

  function findDialogDelete() {
    const dialogs = [...document.querySelectorAll('[role="dialog"], mat-dialog-container')]
      .filter((el) => visible(el) && /delete/i.test(normalize(el.textContent)));
    if (dialogs.length !== 1) return null;
    const buttons = [...dialogs[0].querySelectorAll('button')]
      .filter((el) => visible(el) && normalize(el.textContent) === "Delete");
    return buttons.length === 1 ? buttons[0] : null;
  }

  try {
    const initial = menus();
    console.info(PREFIX, `${initial.length} currently visible chat action controls found.`);
    if (!initial.length) {
      console.warn(PREFIX, "No matching controls. Open the full chat list and load more items.");
      return;
    }
    if (CONFIG.dryRun) {
      console.info(PREFIX, "DRY RUN: no menus clicked and no chats deleted.");
      console.info(PREFIX, "Set CONFIG.dryRun = false and CONFIG.maxDeletes = 1 to test.");
      return;
    }
    if (prompt(`Delete Gemini chats from BOTTOM to TOP? Type DELETE to proceed.\n\nThe operation cannot be undone.`) !== "DELETE") {
      console.warn(PREFIX, "Cancelled by user.");
      return;
    }

    while (state.deleted < CONFIG.maxDeletes) {
      assertRunning();
      const current = menus();
      if (!current.length) break;
      // Re-evaluate the DOM after each deletion. Always take the last visible chat.
      const actionButton = current[current.length - 1];
      actionButton.click();
      const menuDelete = await waitFor(findMenuDelete, "one unambiguous Delete menu item");
      menuDelete.click();
      const dialogDelete = await waitFor(findDialogDelete, "a Delete confirmation dialog");
      dialogDelete.click();
      await waitFor(
        () => !actionButton.isConnected,
        "deleted chat to disappear from the sidebar",
        CONFIG.deleteTimeoutMs,
      );
      state.deleted += 1;
      console.info(PREFIX, `UI-confirmed removals: ${state.deleted}`);
      await sleep(CONFIG.pauseAfterDeleteMs);
    }
    console.info(PREFIX, `Finished. UI-confirmed removals: ${state.deleted}.`);
    console.info(PREFIX, "If additional history loads when you scroll, review and rerun as needed.");
  } catch (err) {
    state.lastError = err.message;
    console.error(PREFIX, "Stopped safely:", err);
  } finally {
    state.running = false;
  }
})();
