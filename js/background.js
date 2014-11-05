

var pluginEnabled=true;
function imageFilter(details) {
  if (!pluginEnabled) { return; }
  if (details.tabId<0){ return; }

  var tab = Cloudinary.getTab(details.tabId);
  var res = Image.fromDetails(details);
  tab.addImage(res);
  res.addListener('headers-loaded',function(data,sender){
    if (res.isCloudinary()){
      tab.notify(res);
    }
  })
}



chrome.webRequest.onResponseStarted.addListener( imageFilter, { urls: ['http://*/*', 'https://*/*'], types: ['image'] }, ['responseHeaders']);
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
  switch (message.type) {
    case 'current::method':
      var current = Cloudinary.getCurrent();
      current[message.method].apply(current,message.args)
      break;
    
    default:
      
  }
});


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


