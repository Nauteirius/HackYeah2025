chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "goToDomain",
    title: "Fact-check selection",
    contexts: ["selection"]
  });
});

// Handle clicks on the context menu item
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "goToDomain" && info.selectionText) {
    const query = encodeURIComponent(info.selectionText.trim());
    const url = `http://localhost:3000?q=${query}`;
    chrome.tabs.create({ url });
  }
});