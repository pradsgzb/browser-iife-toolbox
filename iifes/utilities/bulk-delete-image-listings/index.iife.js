(async () => {

  const CONFIG = {

    dryRun: true,              // Change to false after testing

    maxDeletes: Infinity,      // Set to e.g. 5 for a small real test first

    onlyRowsWithImages: true,  // Keeps it focused on rows containing <img>

    stopOnError: false,

    allowAlreadySelected: false,

    clickDelayMs: 250,

    afterScrollDelayMs: 800,

    checkboxTimeoutMs: 8000,

    dialogTimeoutMs: 10000,

    loadingAppearTimeoutMs: 4000,

    deletionTimeoutMs: 120000,

    rowSettleMs: 700,

    logPrefix: "[bulk-image-delete]"

  };

  if (window.__bulkImageDeleteRunning) {

    console.warn(`${CONFIG.logPrefix} A run is already active.`);

    return;

  }

  window.__bulkImageDeleteRunning = true;

  window.__bulkImageDeleteStopRequested = false;

  window.__stopBulkImageDelete = () => {

    window.__bulkImageDeleteStopRequested = true;

    console.warn(`${CONFIG.logPrefix} Stop requested. The script will stop after the current step.`);

  };

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const normalize = (value) =>

    String(value || "")

      .replace(/\s+/g, " ")

      .trim();

  const log = (...args) => console.log(CONFIG.logPrefix, ...args);

  const warn = (...args) => console.warn(CONFIG.logPrefix, ...args);

  const error = (...args) => console.error(CONFIG.logPrefix, ...args);

  function assertNotStopped() {

    if (window.__bulkImageDeleteStopRequested) {

      throw new Error("Stopped by user.");

    }

  }

  function isVisible(el) {

    if (!el) return false;

    const style = window.getComputedStyle(el);

    if (

      style.display === "none" ||

      style.visibility === "hidden" ||

      Number(style.opacity) === 0

    ) {

      return false;

    }

    const rect = el.getBoundingClientRect();

    return rect.width > 0 && rect.height > 0;

  }

  async function waitUntil(predicate, options = {}) {

    const {

      timeoutMs = 10000,

      intervalMs = 150,

      label = "condition"

    } = options;

    const start = Date.now();

    while (Date.now() - start < timeoutMs) {

      assertNotStopped();

      const result = predicate();

      if (result) return result;

      await sleep(intervalMs);

    }

    throw new Error(`Timed out waiting for ${label}.`);

  }

  function clickLikeUser(el) {

    if (!el) throw new Error("Tried to click a missing element.");

    el.scrollIntoView?.({

      block: "center",

      inline: "nearest"

    });

    el.focus?.({ preventScroll: true });

    el.dispatchEvent(

      new MouseEvent("mousedown", {

        bubbles: true,

        cancelable: true,

        view: window

      })

    );

    el.dispatchEvent(

      new MouseEvent("mouseup", {

        bubbles: true,

        cancelable: true,

        view: window

      })

    );

    el.click();

  }

  function getDialogElements() {

    return Array.from(document.querySelectorAll('[role="dialog"]'))

      .filter(isVisible);

  }

  function getConfirmDialog() {

    return getDialogElements().find((dialog) => {

      const text = normalize(dialog.textContent);

      return (

        /are you sure/i.test(text) &&

        /delete/i.test(text) &&

        !/deletion in progress/i.test(text)

      );

    });

  }

  function getLoadingDialog() {

    return getDialogElements().find((dialog) => {

      const text = normalize(dialog.textContent);

      return (

        /deletion in progress/i.test(text) ||

        /please wait while we delete/i.test(text) ||

        Boolean(dialog.querySelector('[role="progressbar"]'))

      );

    });

  }

  function getExactTextButtons(label, root = document) {

    return Array.from(root.querySelectorAll("button"))

      .filter((button) => {

        if (!isVisible(button)) return false;

        if (button.disabled) return false;

        if (button.getAttribute("aria-disabled") === "true") return false;

        return normalize(button.textContent).toLowerCase() === label.toLowerCase();

      });

  }

  function getPageDeleteButton() {

    const buttons = getExactTextButtons("Delete", document)

      .filter((button) => !button.closest('[role="dialog"]'));

    // Prefer the red/contained MUI delete button if present.

    return (

      buttons.find((button) =>

        String(button.className || "").includes("MuiButton-containedError")

      ) || buttons[0]

    );

  }

  function getConfirmDeleteButton() {

    const dialog = getConfirmDialog();

    if (!dialog) return null;

    const buttons = getExactTextButtons("Delete", dialog);

    return buttons[buttons.length - 1] || null;

  }

  function getRowFromCheckbox(input) {

    return (

      input.closest('div[cursor="pointer"]') ||

      input.closest('div[style*="position: absolute"]') ||

      input.closest('[role="row"]') ||

      input.closest("li") ||

      input.parentElement

    );

  }

  function getRows() {

    const checkboxInputs = Array.from(

      document.querySelectorAll('input[type="checkbox"]')

    );

    const rows = checkboxInputs

      .map(getRowFromCheckbox)

      .filter(Boolean)

      .filter((row) => !row.closest('[role="dialog"]'))

      .filter(isVisible)

      .filter((row) => {

        if (!CONFIG.onlyRowsWithImages) return true;

        return Boolean(row.querySelector("img"));

      });

    return Array.from(new Set(rows));

  }

  function getCheckboxForRow(row) {

    return row.querySelector('input[type="checkbox"]');

  }

  function getCheckboxClickTarget(row) {

    const input = getCheckboxForRow(row);

    return (

      input?.closest('[aria-label^="Select "]') ||

      input?.closest(".MuiCheckbox-root") ||

      input

    );

  }

  function getRowKey(row) {

    const selectEl = row.querySelector('[aria-label^="Select "]');

    const ariaLabel = selectEl?.getAttribute("aria-label");

    if (ariaLabel) {

      return ariaLabel.replace(/^Select\s+/i, "").trim();

    }

    const img = row.querySelector("img");

    if (img?.src) return img.src;

    return normalize(row.textContent).slice(0, 250);

  }

  function findRowByKey(key) {

    return getRows().find((row) => getRowKey(row) === key);

  }

  function getCheckedRows() {

    return getRows().filter((row) => getCheckboxForRow(row)?.checked);

  }

  async function selectSingleRow(row) {

    const input = getCheckboxForRow(row);

    const target = getCheckboxClickTarget(row);

    if (!input || !target) {

      throw new Error("Could not find checkbox for row.");

    }

    if (!input.checked) {

      clickLikeUser(target);

      await waitUntil(

        () => input.checked,

        {

          timeoutMs: CONFIG.checkboxTimeoutMs,

          label: "checkbox to become checked"

        }

      );

    }

    await sleep(CONFIG.clickDelayMs);

  }

  async function unselectRow(row) {

    const input = getCheckboxForRow(row);

    const target = getCheckboxClickTarget(row);

    if (input?.checked && target) {

      clickLikeUser(target);

      await sleep(CONFIG.clickDelayMs);

    }

  }

  async function deleteSelectedRow() {

    const pageDeleteButton = await waitUntil(

      getPageDeleteButton,

      {

        timeoutMs: CONFIG.dialogTimeoutMs,

        label: "page Delete button"

      }

    );

    clickLikeUser(pageDeleteButton);

    await waitUntil(

      getConfirmDialog,

      {

        timeoutMs: CONFIG.dialogTimeoutMs,

        label: "delete confirmation dialog"

      }

    );

    const confirmDeleteButton = await waitUntil(

      getConfirmDeleteButton,

      {

        timeoutMs: CONFIG.dialogTimeoutMs,

        label: "confirmation Delete button"

      }

    );

    clickLikeUser(confirmDeleteButton);

    let loadingAppeared = false;

    try {

      await waitUntil(

        getLoadingDialog,

        {

          timeoutMs: CONFIG.loadingAppearTimeoutMs,

          intervalMs: 100,

          label: "deletion progress popup to appear"

        }

      );

      loadingAppeared = true;

    } catch (_) {

      // Some deletions may finish quickly without showing the progress dialog.

    }

    if (loadingAppeared) {

      await waitUntil(

        () => !getLoadingDialog(),

        {

          timeoutMs: CONFIG.deletionTimeoutMs,

          intervalMs: 300,

          label: "deletion progress popup to disappear"

        }

      );

    } else {

      await sleep(CONFIG.rowSettleMs);

    }

    await sleep(CONFIG.rowSettleMs);

  }

  function getScrollContainer() {

    const firstRow = getRows()[0];

    let el = firstRow?.parentElement;

    while (el && el !== document.body && el !== document.documentElement) {

      const style = window.getComputedStyle(el);

      const canScroll =

        /(auto|scroll)/i.test(style.overflowY) &&

        el.scrollHeight > el.clientHeight + 10;

      if (canScroll) return el;

      el = el.parentElement;

    }

    return document.scrollingElement || document.documentElement;

  }

  async function scrollForMoreRows() {

    const scroller = getScrollContainer();

    const beforeTop = scroller.scrollTop;

    const maxTop = scroller.scrollHeight - scroller.clientHeight;

    if (beforeTop >= maxTop - 5) {

      return false;

    }

    const step = Math.max(200, Math.floor(scroller.clientHeight * 0.85));

    scroller.scrollTop = Math.min(maxTop, beforeTop + step);

    scroller.dispatchEvent(new Event("scroll", { bubbles: true }));

    await sleep(CONFIG.afterScrollDelayMs);

    return scroller.scrollTop > beforeTop + 5;

  }

  try {

    const initialRows = getRows();

    if (!initialRows.length) {

      warn("No matching rows found. Make sure you are on the listings page and rows are visible.");

      return;

    }

    if (CONFIG.dryRun) {

      const preview = initialRows.slice(0, 20).map((row, index) => ({

        visibleIndex: index + 1,

        key: getRowKey(row),

        hasImage: Boolean(row.querySelector("img")),

        checked: Boolean(getCheckboxForRow(row)?.checked),

        textPreview: normalize(row.textContent).slice(0, 120)

      }));

      console.table(preview);

      warn("Dry run only. No clicks were performed.");

      warn("After checking the rows above, change CONFIG.dryRun from true to false.");

      warn("Optional: set CONFIG.maxDeletes to 1 or 5 for a small real test first.");

      return;

    }

    if (CONFIG.allowAlreadySelected === false) {

      const alreadySelected = getCheckedRows();

      if (alreadySelected.length) {

        error(

           `Found ${alreadySelected.length} already-selected row(s). Deselect them first, or set allowAlreadySelected: true.` 

        );

        return;

      }

    }

    const confirmation = prompt(

      "This will repeatedly delete listing rows with images from the current page/list. Type DELETE to continue."

    );

    if (confirmation !== "DELETE") {

      warn("Cancelled.");

      return;

    }

    const processed = new Set();

    const skipped = new Set();

    let deletedCount = 0;

    let noScrollProgressCount = 0;

    log("Started. To stop, run: window.__stopBulkImageDelete()");

    while (deletedCount < CONFIG.maxDeletes) {

      assertNotStopped();

      const rows = getRows();

      const candidate = rows

        .map((row) => ({

          row,

          key: getRowKey(row)

        }))

        .find(({ key }) => !processed.has(key) && !skipped.has(key));

      if (!candidate) {

        const didScroll = await scrollForMoreRows();

        if (!didScroll) {

          noScrollProgressCount += 1;

        } else {

          noScrollProgressCount = 0;

        }

        if (noScrollProgressCount >= 2) {

          break;

        }

        continue;

      }

      const { row, key } = candidate;

      try {

        log(`Selecting row: ${key}`);

        await selectSingleRow(row);

        log(`Deleting row: ${key}`);

        await deleteSelectedRow();

        processed.add(key);

        deletedCount += 1;

        await waitUntil(

          () => {

            const sameRowStillVisible = findRowByKey(key);

            return !sameRowStillVisible;

          },

          {

            timeoutMs: 8000,

            intervalMs: 250,

            label: "deleted row to disappear"

          }

        ).catch(() => {

          // Not fatal. Some virtualized tables reuse DOM nodes.

        });

        log(`Deleted ${deletedCount}: ${key}`);

      } catch (err) {

        skipped.add(key);

        error(`Failed on row ${key}:`, err);

        try {

          await unselectRow(row);

        } catch (_) {}

        if (CONFIG.stopOnError) {

          throw err;

        }

      }

      await sleep(CONFIG.clickDelayMs);

    }

    log(`Finished. Deleted: ${deletedCount}. Skipped: ${skipped.size}.`);

    if (skipped.size) {

      warn("Skipped row keys:", Array.from(skipped));

    }

  } catch (err) {

    error("Stopped with error:", err);

  } finally {

    window.__bulkImageDeleteRunning = false;

  }

})();
