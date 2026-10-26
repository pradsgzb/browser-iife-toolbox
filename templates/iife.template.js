/**
 * @name Example browser IIFE
 * @description Replace this with a concise statement of the task.
 * @target https://example.com/
 * @sideEffects None until you implement a task.
 * @usage Open the target page, inspect the source, paste into DevTools Console.
 */
(() => {
  "use strict";

  const CONFIG = Object.freeze({
    hostname: "example.com",
  });

  if (window.location.hostname !== CONFIG.hostname) {
    console.error(`Open https://${CONFIG.hostname}/ before running this IIFE.`);
    return;
  }

  // Implement an explicitly scoped, documented action here.
  console.info("IIFE template loaded. No changes were made.");
})();
