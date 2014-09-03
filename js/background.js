function imageFilter(asset) {
  if (asset.tabId<0){
    return;
  }
  var res = new Response(asset);
  var tab = Cloudinary.getTab(asset.tabId);
  if (res.isCloudinary()){
    tab.addImage(res);
    tab.notify(res);
  }
}

chrome.webRequest.onResponseStarted.addListener( imageFilter, { urls: ['http://*/*', 'https://*/*'], types: ['image'] }, ['responseHeaders']);


chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (tabId<0){
    return;
  }
  if (tab && tab.url.indexOf("chrome-devtools://")!==0){
    if (changeInfo.status=="loading"){
      Cloudinary.getTab(tabId).reset();
    }
    if (changeInfo.status=="complete"){
      Cloudinary.getTab(tabId).updateContentScript();
    }
  }
});

chrome.tabs.onActivated.addListener(function (active) {
  if (active.tabId<0){
    return;
  }
  chrome.tabs.get(active.tabId,function(tab){
    if (tab && tab.url.indexOf("chrome-devtools://")!==0){
      Cloudinary.setCurrent(active.tabId).notify();
    }
  })
});


