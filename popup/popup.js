chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    /**
     * Send a message to the content script (content.js) on the active tab
     * 
     * @param {number} tabs[0].id - The ID of the currently active tab
     * @param {Object} message - The message object with action type
     * @param {string} message.action - Specifies "getData" to request product information
     * @param {Function} pageData - Callback function that receives the product data from content script
     */
    chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "getData" },
        (pageData) => {
            /**
             * Update the popup UI with the scraped product data
             * The response object contains: title, price, and pic (image URL)
             */
            if(!pageData) return;
            // Display the product title in the popup
            document.getElementById("title").innerText = pageData.title;

            // Display the product price in the popup
            document.getElementById("price").innerText = pageData.price;

            // Set the product image source
            document.getElementById("pic").src = pageData.pic;

            chrome.runtime.sendMessage(
                {
                    action: "getProduct",
                    product: {title: pageData.title}
                },

                (response) => {
                    console.log("Response from background:", response);
                    if(!response?.success) return;

                    const results = document.getElementById("results");
                    results.innerHTML = "";
                    response.items.forEach(item => {
                        const div = document.createElement("div");
                        div.innerHTML = `
                        <img src = "${item.imageUrl}" width = "60" />
                        <p>${item.title}</p>
                        <strong>$${item.price}</strong>
                        <br/>
                        <a href = "${item.url}" target = "_blank">View</a>
                        <hr/>
                        `;
                        results.appendChild(div);
                    })
                }
            )

        }
    );

    
});

