chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//Sends an HTTP request to the backend to send the product details
 if(request.action == "getProduct"){
fetch("https://arabella-shadowed-jeanice.ngrok-free.dev/product", {
    method: "POST", //Indicating that this is sending data 
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify(request.product)
})

// Handles server response
 

.then(response => {
    console.log(response.status);
    return response.json();
})

// Handles data
 
.then(data => {
    sendResponse({ success: true, items: data });
})

// Handles error cases
 .catch(error =>{
    sendResponse({ success: false, error: error.message });
 })

 return true;
}
});




