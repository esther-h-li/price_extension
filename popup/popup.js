chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    /**
     * Send a message to the content script (content.js) on the active tab
     * 
     * @param {number} tabs[0].id - The ID of the currently active tab
     * @param {Object} message - The message object with action type
     * @param {string} message.action - Specifies "getData" to request product information
     * @param {Function} response - Callback function that receives the product data from content script
     */
    chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "getData" },
        (response) => {
            /**
             * Update the popup UI with the scraped product data
             * The response object contains: title, price, and pic (image URL)
             */

            // Display the product title in the popup
            document.getElementById("title").innerText = response.title;

            // Display the product price in the popup
            document.getElementById("price").innerText = response.price;

            // Set the product image source
            document.getElementById("pic").src = response.pic;
        }
    );
});