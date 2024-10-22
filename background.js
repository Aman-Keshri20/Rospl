chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installed");
});

function getAccessToken(callback) {
    chrome.identity.getAuthToken({ interactive: true }, function (token) {
        if (chrome.runtime.lastError) {
            console.error("Error getting token: ", chrome.runtime.lastError);
            callback(null);
        } else {
            callback(token);
        }
    });
}
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'getAccessToken') {
        getAccessToken(function (token) {
            sendResponse(token);
        });
        return true;  // Keep the messaging channel open for async response
    }
});
