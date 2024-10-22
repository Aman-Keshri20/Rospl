// Function to get the OAuth2 Access Token using chrome.identity API
function getAccessToken(callback) {
    chrome.identity.getAuthToken({ interactive: true }, function (token) {
        if (chrome.runtime.lastError) {
            console.error("Error getting token: ", chrome.runtime.lastError);
            callback(null);
        } else {
            console.log("Access Token: ", token);
            callback(token);
        }
    });
}

// Function to upload passwords to Google Drive
function uploadToDrive() {
    // Retrieve stored passwords from local storage
    const storedPasswords = JSON.parse(localStorage.getItem('passwords')) || {};

    // Prepare the data to upload
    const dataToUpload = {
        services: []
    };

    // Build the data structure from stored passwords
    for (const service in storedPasswords) {
        const passwordData = {
            serviceName: service,
            password: storedPasswords[service].password, // Adjust as per your storage format
            email: storedPasswords[service].email // Adjust as per your storage format
        };
        dataToUpload.services.push(passwordData);
    }

    // Convert the data to a JSON format
    const blob = new Blob([JSON.stringify(dataToUpload)], { type: 'application/json' });
    const fileMetadata = {
        name: 'passwords.json', // Set the desired file name for the uploaded file
        mimeType: 'application/json'
    };

    // Get the OAuth2 access token using the getAccessToken function
    getAccessToken((token) => {
        if (token) {
            const form = new FormData();
            form.append('metadata', new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' }));
            form.append('file', blob);

            // Make the POST request to Google Drive API to upload the file
            fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
                method: 'POST',
                headers: new Headers({ 'Authorization': 'Bearer ' + token }),
                body: form,
            })
            .then(response => response.json())
            .then(data => {
                console.log("File uploaded successfully:", data);
                alert("File uploaded successfully to Google Drive!");
            })
            .catch(error => {
                console.error("Error uploading file:", error);
                alert("Error uploading file: " + error);
            });
        } else {
            alert("Failed to retrieve access token.");
        }
    });
}

// Add event listener for the "Upload to Drive" button to trigger the upload
document.getElementById('upload-drive').addEventListener('click', uploadToDrive);
