/**
 * ChatGPT Sidebar Bulk Chat Deleter.
 * Run on https://chatgpt.com/ in the chat-history view.
 * Safety: preview-only by default; never removes DOM nodes as a workaround.
 * Console controls: ChatGPTChatCleaner.status() / ChatGPTChatCleaner.stop().
 * For deleting all chats, also consider ChatGPT's native Data Controls option.
 */
(async function chatGptBulkDeleteChats() {
  "use strict";

  const CONFIG = Object.freeze({
    dryRun: true,              // Set to false only after reviewing the preview.
    maxDeletes: Infinity,      // Set to 1 for a cautious first live run.
    menuTimeoutMs: 10000,
    confirmTimeoutMs: 10000,
    removalTimeoutMs: 20000,
    pauseAfterDeleteMs: 1200,
    pollIntervalMs: 150,
  });
  const PREFIX = "[chatgpt-bulk-delete]";
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const normalize = (text) => String(text || "").replace(/\s+/g, " ").trim();
  const visible = (el) => {
    if (!el?.isConnected) return false;
    const style = getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden") return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  };

  if (location.hostname !== "chatgpt.com") {
    console.error(PREFIX, "Open chatgpt.com before running this script.");
    return;
  }
  if (window.ChatGPTChatCleaner?.running) {
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
  window.ChatGPTChatCleaner = state;

  function assertRunning() {
    if (state.stopRequested) throw new Error("Stopped by user.");
  }
  async function waitFor(predicate, description, timeoutMs) {
    const started = Date.now();
    while (Date.now() - started < timeoutMs) {
      assertRunning();
      const result = predicate();
      if (result) return result;
      await sleep(CONFIG.pollIntervalMs);
    }
    throw new Error(`Timed out waiting for ${description}.`);
  }
  function optionsButtons() {
    return [...document.querySelectorAll('button[data-conversation-options-trigger]')]
      .filter(visible);
  }
  function findDeleteMenuItem() {
    const items = [...document.querySelectorAll('[role="menuitem"]')]
      .filter(visible)
      .filter((el) => /^(delete|delete chat|delete conversation)$/i.test(normalize(el.textContent)));
    return items.length === 1 ? items[0] : null;
  }
  function findConfirmButton() {
    const buttons = [...document.querySelectorAll('button[data-testid="delete-conversation-confirm-button"]')]
      .filter(visible);
    return buttons.length === 1 ? buttons[0] : null;
  }

  try {
    const initialButtons = optionsButtons();
    console.info(PREFIX, `${initialButtons.length} visible chat option controls found.`);
    if (!initialButtons.length) {
      console.warn(PREFIX, "No matching buttons in the loaded sidebar. Open the chat-history list.");
      return;
    }
    if (CONFIG.dryRun) {
      console.info(PREFIX, "DRY RUN: no menus clicked and no chats deleted.");
      console.info(PREFIX, "Set CONFIG.dryRun = false and CONFIG.maxDeletes = 1 to test.");
      return;
    }
    if (prompt("Permanently delete loaded ChatGPT conversations? Type DELETE to proceed.") !== "DELETE") {
      console.warn(PREFIX, "Cancelled by user.");
      return;
    }

    while (state.deleted < CONFIG.maxDeletes) {
      assertRunning();
      const actionButton = optionsButtons()[0];
      if (!actionButton) break;
      actionButton.click();
      const deleteItem = await waitFor(findDeleteMenuItem, "one Delete menu item", CONFIG.menuTimeoutMs);
      deleteItem.click();
      const confirm = await waitFor(findConfirmButton, "delete confirmation button", CONFIG.confirmTimeoutMs);
      confirm.click();
      await waitFor(() => !actionButton.isConnected, "deleted chat to leave the sidebar", CONFIG.removalTimeoutMs);
      state.deleted += 1;
      console.info(PREFIX, `UI-confirmed removals: ${state.deleted}`);
      await sleep(CONFIG.pauseAfterDeleteMs);
    }
    console.info(PREFIX, `Finished. UI-confirmed removals: ${state.deleted}.`);
    console.info(PREFIX, "The sidebar can load older chats on scroll; review the full history separately.");
  } catch (err) {
    state.lastError = err.message;
    console.error(PREFIX, "Stopped safely:", err);
  } finally {
    state.running = false;
  }
})();
