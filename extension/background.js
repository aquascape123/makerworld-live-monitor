// Background service worker per fare da relay alle richieste HTTP
chrome.runtime.onInstalled.addListener(() => {
  console.log('MakerWorld Monitor background script installed');
});
// Gestisce le richieste dall'content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "sendToESP32") {
    console.log('Background: Sending to ESP32:', request.endpoint, request.data);
    
    fetch(`http://${request.ip}/${request.endpoint}`, {
      method: request.method || 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request.data),
      signal: AbortSignal.timeout(15000) // <-- AUMENTA DA 10000 A 15000
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      return response.text();
    })
    .then(data => {
      console.log('Background: ESP32 response:', data);
      sendResponse({success: true, data});
    })
    .catch(error => {
      console.error('Background: ESP32 error:', error.message);
      sendResponse({success: false, error: error.message});
    });
    
    return true; // Keep channel open
  }
  
  if (request.action === "testESP32") {
    console.log('Background: Testing ESP32 connection');
    
    fetch(`http://${request.ip}/ping`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    })
    .then(response => {
      if (response.ok) {
        sendResponse({success: true});
      } else {
        sendResponse({success: false, error: `HTTP ${response.status}`});
      }
    })
    .catch(error => {
      console.error('Background: ESP32 test error:', error);
      sendResponse({success: false, error: error.message});
    });
    
    return true;
  }

  if (request.action === "testESP32Notification") {
    console.log('Background: Sending test notification');
    
    fetch(`http://${request.ip}/test`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    })
    .then(data => {
      console.log('Background: Test notification response:', data);
      sendResponse({success: true, data});
    })
    .catch(error => {
      console.error('Background: Test notification error:', error);
      sendResponse({success: false, error: error.message});
    });
    
    return true;
  }
});
