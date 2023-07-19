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

  // Create a mutation observer
  const observer = new MutationObserver((mutations) => {
    // Loop through the mutations
    for (const mutation of mutations) {
      // Check if any nodes were added
      if (mutation.addedNodes.length > 0) {
        // Loop through the added nodes
        for (const node of mutation.addedNodes) {
          // Check if the node is the map element
          if (node.classList.contains("MapSearch__MapWrapper-sc-1ibpnqf-1")) {
            // Select the map element
            const map = node;
            console.log("Map element", map);
            // Add a click event listener with useCapture option
            map.addEventListener(
              "click",
              () => {
                console.log("Map clicked");

                // Wait for a short delay to let the listings load
                setTimeout(() => {
                  // Select all the listing elements
                  const mapListing = document.getElementsByClassName(
                    "SubUnit__Wrapper-sc-10x486s-0"
                  )[0];

                  if (mapListing) {
                    console.log("Found map listing:", mapListing);

                    // Get the listing id from the href attribute
                    const href = mapListing.getAttribute("href");
                    const id = href.split("/").pop();
                    console.log("Listing id", id);
                  }

                  // // Iterate over them and append a button to each thumbnail
                  // for (const listing of listings) {
                  //   // Get the listing id from the href attribute
                  //   const href = listing.getAttribute("href");
                  //   const id = href.split("/").pop();
                  //   console.log("Listing id", id);
                  //   // // Create a button for this listing
                  //   // const button = createButton(id);
                  //   // // Append it to the thumbnail div
                  //   // const thumbnail = listing.querySelector(
                  //   //   ".SubUnit__ThumbnailBackdrop-sc-10x486s-2"
                  //   // );
                  //   // thumbnail.appendChild(button);
                  // }
                }, 500); // Adjust the delay as needed
              },
              true
            ); // Set useCapture to true
            // Disconnect the observer
            observer.disconnect();
            // Break the loop
            break;
          }
        }
      }
    }
  });

  // Select the parent element of the map element
  const parent = document.querySelector(
    ".SearchPage__MapSearchContainer-gg133s-11"
  );

  // Start observing the parent element for child node changes
  observer.observe(parent, { childList: true });

  // console.log(map);
  // // Add a click event listener
  // map.on("click", (e) => {
  //   console.log("Map clicked", e);
  //   // // Wait for a short delay to let the listings load
  //   // setTimeout(() => {
  //   //   // Select all the listing elements
  //   //   const listings = document.querySelectorAll(
  //   //     ".SubUnit__Wrapper-sc-10x486s-0"
  //   //   );

  //   //   // Iterate over them and append a button to each thumbnail
  //   //   for (const listing of listings) {
  //   //     // Get the listing id from the href attribute
  //   //     const href = listing.getAttribute("href");
  //   //     const id = href.split("/").pop();
  //   //     // Create a button for this listing
  //   //     const button = createButton(id);
  //   //     // Append it to the thumbnail div
  //   //     const thumbnail = listing.querySelector(
  //   //       ".SubUnit__ThumbnailBackdrop-sc-10x486s-2"
  //   //     );
  //   //     thumbnail.appendChild(button);
  //   //   }
  //   // }, 500); // Adjust the delay as needed
  // });
})();
