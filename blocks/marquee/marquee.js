/**
 * Marquee initializer
 * - Duplicates content to create a seamless loop
 * - Adds a .marquee-track wrapper that gets animated via CSS
 * - Accessible: sets aria attributes and hover pause (via CSS)
 */

(function () {
  // Helper to create the moving track and duplicate items
  function initMarquee(root) {
    if (!root) return;

    // Ensure we only init once
    if (root.dataset.marqueeInitialized === "true") return;

    // Find the element containing the items (your .marleft)
    const source = root.querySelector(".marleft");
    if (!source) return;

    // Create the moving track wrapper
    const track = document.createElement("div");
    track.className = "marquee-track";
    track.setAttribute("role", "marquee"); // non-standard but useful
    track.setAttribute("aria-live", "polite"); // reduce screen reader churn

    // Collect items from source
    const items = Array.from(source.children).filter((el) =>
      el.classList.contains("txmartex")
    );

    if (items.length === 0) return;

    // Duplicate content for seamless scroll (track = items + items)
    const fragment1 = document.createDocumentFragment();
    const fragment2 = document.createDocumentFragment();

    items.forEach((node) => {
      // clone for the first set
      const a = node.cloneNode(true);
      fragment1.appendChild(a);

      // clone for the second set
      const b = node.cloneNode(true);
      fragment2.appendChild(b);
    });

    track.appendChild(fragment1);
    track.appendChild(fragment2);

    // Clear original container (.marleft) and mount the track inside it
    source.innerHTML = "";
    source.appendChild(track);

    // Mark initialized
    root.dataset.marqueeInitialized = "true";
  }

  // Initialize all marquees found on page
  function initAll() {
    const marquees = document.querySelectorAll(".marquee.txmartext");
    marquees.forEach(initMarquee);
  }

  // Run after DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll);
  } else {
    initAll();
  }

  // Optional: re-init if fonts load (to stabilize widths)
  if ("fonts" in document) {
    document.fonts.addEventListener?.("loadingdone", () => {
      // Re-initialize in case text widths changed after custom fonts loaded
      document
        .querySelectorAll(".marquee.txmartext")
        .forEach((root) => {
          // reset init flag and re-run
          root.dataset.marqueeInitialized = "false";
          // restore original content? Not necessary since we keep structure minimal
          initMarquee(root);
        });
    });
  }
})();
