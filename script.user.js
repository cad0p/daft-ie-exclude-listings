// ==UserScript==
// @name         Daft.ie exclude listings
// @namespace    https://github.com/cad0p
// @version      0.1
// @description  try to get a place to stay in Ireland!
// @author       Pier Carlo Cadoppi
// @match        https://www.daft.ie/*/mapArea?showMap=true*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=daft.ie
// @grant        none
// @license      MIT
// ==/UserScript==

(function () {
  const listingsToExclude = new Set([5326983]);

  const origOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function () {
    this.addEventListener("load", function () {
      // Only intercept JSON requests.
      const contentType = this.getResponseHeader("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        return;
      }
      const res = JSON.parse(this.responseText);
      if ("listings" in res) {
        // Filter the listings
        res.listings = res.listings.filter(
          (l) => !listingsToExclude.has(l.listing.id)
        );
        // Override the response text.
        Object.defineProperty(this, "responseText", {
          get() {
            return JSON.stringify(res);
          },
        });
      }
    });
    origOpen.apply(this, arguments);
  };
})();
