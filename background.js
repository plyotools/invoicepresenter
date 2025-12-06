// Open the app in a new window when the extension icon is clicked
chrome.action.onClicked.addListener(() => {
  chrome.windows.create({
    url: chrome.runtime.getURL('index.html'),
    type: 'popup',
    width: 1400,
    height: 900,
    focused: true
  });
});

