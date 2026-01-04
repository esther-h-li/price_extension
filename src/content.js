
/**
 * Product Data Scraper - Chrome Extension Content Script
 * 
 * This content script runs on web pages and extracts product information
 * (title, price, and image) using a MutationObserver to wait for dynamic
 * content to load. Once all data is collected, it responds to messages
 * from the extension's background script with the scraped data.
 * Specifically built for eBay, for now.
 */

/**
 * Product object stores the scraped data
 * @type {Object}
 * @property {string} title - The product title (defaults to "Loading...")
 * @property {string} price - The product price (defaults to "Loading")
 * @property {string|null} pic - The product image URL (null until found)
 */
let product = {
    title: "Loading...",
    price: "Loading",
    pic: null
};

/**
 * Tracking object to mark which data fields have been successfully found
 * Prevents unnecessary DOM queries once data is located
 * @type {Object}
 * @property {boolean} title - True when product title is found
 * @property {boolean} price - True when product price is found
 * @property {boolean} pic - True when product image is found
 */
let found = {
    title: false,
    price: false,
    pic: false
};

/**
 * MutationObserver watches for DOM changes and triggers the callback function.
 */
const observer = new MutationObserver(callback);

/**
 * Start observing the DOM for changes
 * Watches the entire document tree for structural changes and attribute updates
 */
observer.observe(document, {
    childList: true,      // Watch for added/removed child nodes
    subtree: true,        // Watch the entire document, not just root level
    attributes: true,     // Watch for attribute changes
    attributeFilter: ['src', 'data-src', 'data-img'] // Only watch image-related attributes
});

/**
 * Callback function executed whenever DOM mutations occur
 * Attempts to locate and extract product data from the page
 * 
 * @param {MutationRecord[]} mutationList - Array of mutation records from observer
 * @param {MutationObserver} observer - The observer instance
 */
function callback(mutationList, observer) {
    // Extract product title if not already found
    if (!found.title) {
        const viewed_title = document.querySelector(
            "#mainContent > div > div.vim.x-item-title > h1 > span"
        );
        if (viewed_title) {
            product.title = viewed_title.firstChild.textContent;
            found.title = true;
        }
    }

    // Extract product price if not already found
    if (!found.price) {
        const viewed_price = document.querySelector(
            "#mainContent > div > div.vim.x-price-section.mar-t-20 > div.vim.x-bin-price > div > div.x-price-primary > span"
        );
        if (viewed_price) {
            product.price = viewed_price.firstChild.textContent;
            found.price = true;
        }
    }

    // Extract product image if not already found
    // Tries multiple attribute sources for compatibility with different image loading strategies
    if (!found.pic) {
        const imgEl = document.querySelector("#PicturePanel img");
        if (imgEl) {
            // Fallback chain: src → data-src → data-img
            product.pic = imgEl.src || imgEl.getAttribute("data-src") || imgEl.getAttribute("data-img");
            found.pic = true;
        }
    }

    // Stop observing once all data has been found to save resources
    if (found.title && found.price && found.pic) {
        observer.disconnect();
    }
}

/**
 * Message listener for Chrome Extension communication
 * Listens for messages from the extension's background/popup script (popup.js)
 * 
 * When a "getData" action is received, responds with the collected product data
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Check if the message requests product data
    if (message.action === "getData") {
        // Send the current product data back to the sender
        sendResponse(product);
    }
    // Return true to indicate we'll send an async response (if needed)
    return true;
});


//Sends an HTTP request to the backend to send the product details
 

fetch("http://localhost:8080/prices", {
    method: "POST", //Indicating that this is sending data 
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify(product)
})

// Handles server response
 

.then(response => {
    console.log(response.status);
    return response.text();
})

// Handles parsed text
 

.then(text => {
    console.log(text);
})

// Handles error cases
 .catch(error =>{
    console.error(error);
 })

