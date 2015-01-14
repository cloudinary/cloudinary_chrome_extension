
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
  switch (message.type) {
    case 'current::method':
      var current = Cloudinary.getCurrent();
      current[message.method].apply(current,message.args);
      break;
    
    default:
      
  }
});


chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (tabId<0){ return; }
  if (changeInfo.status=="loading"){
    tabLoaded=false;
    Cloudinary.getTab(tabId).reset();
  }
  if (tab && tab.url.indexOf("chrome-devtools://")!==0){
    if (changeInfo.status=="complete"){
      tab = Cloudinary.getTab(tabId);
      tab.updateContentState();
      tab.notifyLoadComplete();
    }
  }
});

chrome.tabs.onActivated.addListener(function (active) {
  if (active.tabId<0){ return; }
  chrome.tabs.get(active.tabId,function(tab){
    if (tab && tab.url.indexOf("chrome-devtools://")!==0){
      Cloudinary.setCurrent(active.tabId).notify();
    }
  });
});


chrome.tabs.onRemoved.addListener(function (tabId,info){
  if (tabId<0){ return; }
  Cloudinary.removeTab(tabId);
  delete Cloudinary.tabs[tabId];
});

// Web Request Hooks 
var akamai_debug_headers = "akamai-x-get-client-ip, akamai-x-cache-on, akamai-x-cache-remote-on, akamai-x-check-cacheable, akamai-x-get-cache-key, akamai-x-get-extracted-values, akamai-x-get-nonces, akamai-x-get-ssl-client-session-id, akamai-x-get-true-cache-key, akamai-x-serial-no";
var akamai_pragma = { "name":"Pragma", "value":akamai_debug_headers};
function add_akamai_debug_headres(details) {

  var pragma_exists = false;
  for (var i = 0; i < details.requestHeaders.length; ++i) {
    if (details.requestHeaders[i].name === 'Pragma') {
      details.requestHeaders[i].value = details.requestHeaders[i].value.concat(", ",akamai_debug_headers);
      pragma_exists = true;
      break;
    }
  }
  if(!pragma_exists) {
    details.requestHeaders.push(akamai_pragma);
  }
  return {requestHeaders: details.requestHeaders};
}

function image_filter(details) {
  if (details.tabId<0){ return; }

  var tab = Cloudinary.getTab(details.tabId);
  var res = Image.fromDetails(details);
  tab.addImage(res);
  res.addListener('headers-loaded',function(data,sender){
    if (res.isCloudinary()){
      tab.notify(res);
    }
  });
}


chrome.webRequest.onResponseStarted.addListener( image_filter, { urls: ['http://*/*', 'https://*/*'], types: ['image'] }, ['responseHeaders']);
update_request_listeners();

function update_request_listeners(){
  chrome.storage.local.get(Cloudinary.defaults.general,function(general_options){
    if (general_options.general_akamai_headers===true){
      chrome.webRequest.onBeforeSendHeaders.addListener(add_akamai_debug_headres, {urls: ["<all_urls>"]}, ["blocking", "requestHeaders"]);
    }else{
      chrome.webRequest.onBeforeSendHeaders.removeListener(add_akamai_debug_headres);
    }
  });
}
chrome.extension.onRequest.addListener(function(request){
  if (request && request.id == "settings_updated"){
    update_request_listeners();
  }
});

