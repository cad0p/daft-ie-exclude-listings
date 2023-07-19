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

  // Add a listing id to the exclude set
  function excludeListing(id) {
    listingsToExclude.add(id);
    console.log(`Excluded listing ${id}`);
  }

  // Create a button element to exclude a listing
  function createButton(id) {
    const button = document.createElement("button");
    button.style.position = "absolute";
    button.style.top = "0";
    button.style.right = "0";
    button.style.backgroundColor = "red";
    button.style.color = "white";
    button.style.border = "none";
    button.style.padding = "5px";
    button.style.cursor = "pointer";
    button.textContent = "X";
    button.addEventListener("click", () => excludeListing(id));
    return button;
  }
  // Select all the listing elements
  const listings = document.querySelectorAll(".SubUnit__Wrapper-sc-10x486s-0");
  console.log(listings);

  // Iterate over them and append a button to each thumbnail
  for (const listing of listings) {
    // Get the listing id from the href attribute
    const href = listing.getAttribute("href");
    const id = href.split("/").pop();
    // Create a button for this listing
    const button = createButton(id);
    // Append it to the thumbnail div
    const thumbnail = listing.querySelector(
      ".SubUnit__ThumbnailBackdrop-sc-10x486s-2"
    );
    thumbnail.appendChild(button);
  }
})();
