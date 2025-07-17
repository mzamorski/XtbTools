function sendMessageCommisionRateChanged(commisionRate) {
    if (typeof commisionRate !== 'number' || !Number.isInteger(commisionRate)) {
        console.error("Error: commisionRate must be an integer.");
        return;
    }

    let message = {
        type: "commision-rate-changed",
        commisionRate: commisionRate
    };
    chrome.runtime.sendMessage(message);
}

function sendMessageSettingsPopupOpened() {
    chrome.runtime.sendMessage({type: "settings-popup-oppened"});
}

function sendMessageShowBasePriceChanged(show) {
    chrome.runtime.sendMessage({type: "show-base-price-changed", value: show});
}

function sendMessageEnableExtensionChanged(enable) {
    chrome.runtime.sendMessage({type: "enable-extension-changed", value: enable});
}

function sendMessagePageLoaded() {
    let message = {
        type: "page-loaded",
    };
    
    chrome.runtime.sendMessage(message);
}

