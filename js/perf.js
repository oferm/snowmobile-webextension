(() => {
  "use strict";

  // Keep off-screen post images from competing with the page's initial render.
  // Start observing at document-start so parser-created images are marked as
  // soon as their post row enters the document.
  if (!/^\/ski-forum\/viewtopic\.php$/.test(window.location.pathname)) return;

  function prepareImage(image) {
    if (!image.closest(".post_row")) return;
    if (!image.hasAttribute("loading")) image.loading = "lazy";
    if (!image.hasAttribute("decoding")) image.decoding = "async";
  }

  function prepareImages(root) {
    if (root instanceof HTMLImageElement) prepareImage(root);
    root.querySelectorAll?.("img").forEach(prepareImage);
  }

  const observer = new MutationObserver((records) => {
    for (const record of records) {
      record.addedNodes.forEach(prepareImages);
    }
  });
  observer.observe(document, { childList: true, subtree: true });
  prepareImages(document);
  document.addEventListener("DOMContentLoaded", () => observer.disconnect(), { once: true });
})();
