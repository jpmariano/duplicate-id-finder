const highlightToggle = document.getElementById("highlightToggle");
const statusElement = document.getElementById("status");

/**
 * Runs when the popup opens.
 * It checks whether this extension currently has highlights on the page
 * and synchronizes the toggle with that state.
 */
document.addEventListener("DOMContentLoaded", async () => {
  highlightToggle.disabled = true;

  try {
    const tab = await getActiveTab();

    if (!tab?.id) {
      throw new Error("No active tab was found.");
    }

    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: getHighlightState
    });

    const isEnabled = Boolean(results[0]?.result);

    highlightToggle.checked = isEnabled;

    if (isEnabled) {
      setStatus("Duplicate-ID highlighting is enabled.", "success");
    } else {
      setStatus("Duplicate-ID highlighting is disabled.");
    }
  } catch (error) {
    console.error("Unable to check the highlighting state:", error);

    highlightToggle.checked = false;
    setStatus(
      "This extension cannot run on this page. Try opening a normal website.",
      "error"
    );
  } finally {
    highlightToggle.disabled = false;
  }
});

/**
 * Runs whenever the user turns the toggle on or off.
 */
highlightToggle.addEventListener("change", async () => {
  const shouldEnable = highlightToggle.checked;

  highlightToggle.disabled = true;
  setStatus(
    shouldEnable
      ? "Searching for duplicate IDs..."
      : "Removing highlights..."
  );

  try {
    const tab = await getActiveTab();

    if (!tab?.id) {
      throw new Error("No active tab was found.");
    }

    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: setDuplicateIdHighlighting,
      args: [shouldEnable]
    });

    const result = results[0]?.result;

    if (!result) {
      throw new Error("The page did not return a result.");
    }

    if (result.status === "enabled") {
      const duplicateWord =
        result.duplicateIdCount === 1 ? "duplicate ID" : "duplicate IDs";

      const elementWord =
        result.highlightedElementCount === 1 ? "element" : "elements";

      setStatus(
        `Found ${result.duplicateIdCount} ${duplicateWord}. ` +
        `Highlighted ${result.highlightedElementCount} ${elementWord}.` +
        `Check console for additional details.`,
        "success"
      );
    } else if (result.status === "none-found") {
      highlightToggle.checked = false;
      setStatus("No duplicate IDs were found on this page.", "success");
    } else if (result.status === "disabled") {
      setStatus("Duplicate-ID highlighting is disabled.");
    }
  } catch (error) {
    console.error("Unable to update duplicate-ID highlighting:", error);

    // Return the toggle to its previous state if the operation failed.
    highlightToggle.checked = !shouldEnable;

    setStatus(
      "This extension cannot run on this page. Try opening a normal website.",
      "error"
    );
  } finally {
    highlightToggle.disabled = false;
  }
});

/**
 * Gets the currently active tab.
 */
async function getActiveTab() {
  const tabs = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  return tabs[0];
}

/**
 * Updates the status message inside the popup.
 */
function setStatus(message, type = "") {
  statusElement.textContent = message;
  statusElement.className = type;
}

/**
 * This function executes inside the active webpage.
 *
 * It returns true when elements highlighted by this extension
 * currently exist on the page.
 */
function getHighlightState() {
  return Boolean(
    document.querySelector(
      '[data-duplicate-id-visual-finder-highlighted="true"]'
    )
  );
}

/**
 * This function executes inside the active webpage.
 *
 * When enabled is true:
 * - It finds duplicate IDs.
 * - It highlights every element using a duplicate ID.
 *
 * When enabled is false:
 * - It removes the extension's highlights.
 * - It restores each element's previous inline outline styles.
 */
function setDuplicateIdHighlighting(enabled) {
  const highlightedSelector =
    '[data-duplicate-id-visual-finder-highlighted="true"]';

  /**
   * Removes existing extension highlights and restores the original styles.
   */
  function removeHighlights() {
    const highlightedElements =
      document.querySelectorAll(highlightedSelector);

    highlightedElements.forEach((element) => {
      const originalOutline =
        element.dataset.duplicateIdVisualFinderOriginalOutline ?? "";

      const originalOutlineOffset =
        element.dataset.duplicateIdVisualFinderOriginalOutlineOffset ?? "";

      element.style.outline = originalOutline;
      element.style.outlineOffset = originalOutlineOffset;

      delete element.dataset.duplicateIdVisualFinderHighlighted;
      delete element.dataset.duplicateIdVisualFinderOriginalOutline;
      delete element.dataset.duplicateIdVisualFinderOriginalOutlineOffset;
    });

    return highlightedElements.length;
  }

  // Always clear old highlights before rescanning.
  const removedHighlightCount = removeHighlights();

  if (!enabled) {
    console.log(
      `%c Duplicate ID highlighting disabled. Removed ${removedHighlightCount} highlight(s).`,
      "color: green; font-weight: bold;"
    );

    return {
      status: "disabled",
      removedHighlightCount
    };
  }

  const elementsWithIds = document.querySelectorAll("[id]");
  const elementsById = new Map();

  /**
   * Groups all page elements according to their ID.
   */
  elementsWithIds.forEach((element) => {
    const id = element.id.trim();

    if (!id) {
      return;
    }

    if (!elementsById.has(id)) {
      elementsById.set(id, []);
    }

    elementsById.get(id).push(element);
  });

  /**
   * Keeps only IDs that appear more than once.
   */
  const duplicates = Array.from(elementsById.entries()).filter(
    ([, elements]) => elements.length > 1
  );

  if (duplicates.length === 0) {
    console.log(
      "%c No duplicate IDs found!",
      "color: green; font-weight: bold;"
    );

    return {
      status: "none-found",
      duplicateIdCount: 0,
      highlightedElementCount: 0
    };
  }

  let highlightedElementCount = 0;

  console.error(
    `%c Found ${duplicates.length} duplicate ID(s)!`,
    "font-weight: bold;"
  );

  /**
   * Highlights and logs every element associated with a duplicate ID.
   */
  duplicates.forEach(([id, elements]) => {
    console.group(`ID: "${id}" appears ${elements.length} times`);

    elements.forEach((element, index) => {
      // Preserve the element's existing inline styles so they can be restored.
      element.dataset.duplicateIdVisualFinderOriginalOutline =
        element.style.outline;

      element.dataset.duplicateIdVisualFinderOriginalOutlineOffset =
        element.style.outlineOffset;

      element.dataset.duplicateIdVisualFinderHighlighted = "true";

      // Outline is used instead of border so the page layout does not shift.
      element.style.outline = "3px solid red";
      element.style.outlineOffset = "2px";

      highlightedElementCount += 1;

      console.log(`Occurrence ${index + 1}:`, element);
    });

    console.groupEnd();
  });

  return {
    status: "enabled",
    duplicateIdCount: duplicates.length,
    highlightedElementCount
  };
}