(() => {
  "use strict";

  const CONFIG = Object.freeze({
    username: "archanafineart_", // Change only if operating on another account.
    keepFirst: 5,              // Preserve the first 5 PROFILE-GRID items.
    maxDeletions: Infinity,     // Optional limit for a single run.
    minDelayMs: 4500,
    maxDelayMs: 7000,
    waitTimeoutMs: 20000,
    scrollWaitMs: 1800,
    maxEmptyScrolls: 5,
  });

  const profilePath = `/${CONFIG.username}/`;
  const currentPath = location.pathname.replace(/\/+$/, "/");

  if (!/(^|\.)instagram\.com$/i.test(location.hostname) || currentPath !== profilePath) {
    console.error(`Open https://www.instagram.com${profilePath} before running this script.`);
    return;
  }

  if (window.IGPostCleaner?.running) {
    console.warn("An Instagram post-cleaner instance is already running.");
    return;
  }

  const state = {
    running: true,
    stopRequested: false,
    kept: new Set(),
    deleted: [],
    attempted: new Set(),
    current: null,
    lastError: null,
  };

  window.IGPostCleaner = {
    get running() { return state.running; },
    stop() {
      state.stopRequested = true;
      console.warn("Stop requested; no further posts will be started.");
    },
    status() {
      const result = {
        running: state.running,
        stopRequested: state.stopRequested,
        currentlyProcessing: state.current,
        protectedPosts: [...state.kept],
        deletedPosts: [...state.deleted],
        lastError: state.lastError,
      };
      console.log("Instagram post cleaner status:", result);
      return result;
    },
  };

  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  const randomDelay = () =>
    CONFIG.minDelayMs + Math.random() * (CONFIG.maxDelayMs - CONFIG.minDelayMs);

  function assertRunning() {
    if (state.stopRequested) throw new Error("Stopped by user.");
  }

  function canonicalPath(href) {
    try {
      const url = new URL(href, location.origin);
      if (url.origin !== location.origin) return null;
      const match = url.pathname.match(/^\/([^/]+)\/(p|reel)\/([^/]+)\/?$/i);
      if (!match || match[1].toLowerCase() !== CONFIG.username.toLowerCase()) return null;
      return `/${CONFIG.username}/${match[2].toLowerCase()}/${match[3]}/`;
    } catch {
      return null;
    }
  }

  function gridPosts() {
    // The supplied markup identifies both posts and reels as thumbnail links.
    // Keep only image-backed links within the visible account's profile grid.
    const scope = document.querySelector("main") ?? document;
    const found = new Map();
    for (const anchor of scope.querySelectorAll("a[href]")) {
      const path = canonicalPath(anchor.getAttribute("href"));
      if (path && anchor.querySelector("img") && !found.has(path)) {
        found.set(path, { path, anchor });
      }
    }
    return [...found.values()];
  }

  function visible(element) {
    return !!element && element.isConnected && element.getClientRects().length > 0;
  }

  function dialogs() {
    return [...document.querySelectorAll('[role="dialog"][aria-modal="true"]')]
      .filter(visible);
  }

  function exactButton(dialog, label) {
    return [...dialog.querySelectorAll("button")].find(button =>
      visible(button) && button.textContent.trim().replace(/\s+/g, " ") === label
    );
  }

  function modalFor(path) {
    return dialogs().find(dialog => {
      const options = dialog.querySelector(
        '[class~="PolarisPost/optionsButton"] [role="button"]'
      );
      if (!visible(options)) return false;
      return [...dialog.querySelectorAll("a[href]")].some(a =>
        canonicalPath(a.getAttribute("href")) === path
      );
    });
  }

  async function waitFor(find, description, timeoutMs = CONFIG.waitTimeoutMs) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      assertRunning();
      const result = find();
      if (result) return result;
      await delay(250);
    }
    throw new Error(`Timed out waiting for ${description}.`);
  }

  async function deletePost(post) {
    const { path, anchor } = post;
    state.current = path;
    state.attempted.add(path);
    console.log(`[${state.deleted.length + 1}] Opening ${path}`);

    anchor.scrollIntoView({ block: "center", behavior: "instant" });
    await delay(250);
    assertRunning();
    anchor.click();

    const postDialog = await waitFor(() => modalFor(path), `post dialog: ${path}`);
    const options = postDialog.querySelector(
      '[class~="PolarisPost/optionsButton"] [role="button"]'
    );
    options.click();

    const menu = await waitFor(
      () => dialogs().find(dialog =>
        dialog !== postDialog &&
        !/^Delete\b/i.test(dialog.querySelector("h3")?.textContent?.trim() ?? "") &&
        exactButton(dialog, "Delete")
      ),
      "the More options / Delete menu"
    );
    exactButton(menu, "Delete").click();

    const confirmation = await waitFor(
      () => dialogs().find(dialog =>
        /^Delete\b/i.test(dialog.querySelector("h3")?.textContent?.trim() ?? "") &&
        exactButton(dialog, "Delete")
      ),
      "the Delete post? confirmation"
    );

    // Only this button performs the destructive operation.
    exactButton(confirmation, "Delete").click();

    await waitFor(
      () => !visible(confirmation),
      "the deletion confirmation to close"
    );
    await waitFor(
      () => !gridPosts().some(item => item.path === path),
      `the deleted post to disappear from the profile grid`
    );

    state.deleted.push(path);
    state.current = null;
    console.log(`Deleted (${state.deleted.length} total): ${path}`);
    await delay(randomDelay());
  }

  async function discoverMorePosts() {
    const known = new Set(gridPosts().map(item => item.path));
    for (let i = 0; i < CONFIG.maxEmptyScrolls; i++) {
      assertRunning();
      const scroller = document.scrollingElement ?? document.documentElement;
      scroller.scrollTop = scroller.scrollHeight;
      await delay(CONFIG.scrollWaitMs);
      if (gridPosts().some(item => !known.has(item.path))) return true;
    }
    return false;
  }

  async function run() {
    try {
      await waitFor(() => gridPosts().length >= CONFIG.keepFirst && gridPosts(),
        `at least ${CONFIG.keepFirst} profile posts`);

      // Snapshot BEFORE any deletion. Never recalculate the protected positions.
      const initialPosts = gridPosts();
      for (const post of initialPosts.slice(0, CONFIG.keepFirst)) state.kept.add(post.path);
      console.log("Protected posts (these will NOT be deleted):", [...state.kept]);
      console.log(`Currently loaded: ${initialPosts.length} posts/reels.`);

      const approved = window.confirm(
        `DELETE INSTAGRAM POSTS — @${CONFIG.username}\n\n` +
        `Keep the FIRST ${CONFIG.keepFirst} profile-grid items:\n` +
        [...state.kept].map((p, i) => `${i + 1}. ${p}`).join("\n") +
        `\n\nDelete all other posts/reels found by scrolling this profile?\n` +
        `This operation is destructive and may not be reversible.\n\n` +
        `Click OK to start, or Cancel to exit.`
      );
      if (!approved) {
        console.info("Cancelled. No posts were deleted.");
        return;
      }

      while (state.deleted.length < CONFIG.maxDeletions) {
        assertRunning();
        const next = gridPosts().find(item =>
          !state.kept.has(item.path) && !state.attempted.has(item.path)
        );
        if (next) {
          await deletePost(next);
          continue;
        }
        if (!(await discoverMorePosts())) break;
      }
      console.info(
        `Finished scanning. ${state.deleted.length} post(s) deleted; ` +
        `${state.kept.size} originally selected posts protected. ` +
        "Check the profile manually for any remaining items."
      );
    } catch (error) {
      state.lastError = error instanceof Error ? error.message : String(error);
      console.error(`Post cleaner stopped: ${state.lastError}`);
      console.warn("Inspect Instagram before restarting; a pending deletion may need checking.");
    } finally {
      state.running = false;
      state.current = null;
      console.info("Use IGPostCleaner.status() to review this run.");
    }
  }

  void run();
})();
