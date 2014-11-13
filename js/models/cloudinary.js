var Cloudinary = function(tabId){
  this.tabId = tabId
  this.imagesReportedToContent = -1;
  this.highlightElements=false;
  this.executionContext = 'background'
  this.reset();
};


Cloudinary.prototype.reset = function(size){
  this._images = new Array(); 
  this._cached_images= new Array(); 
  this.tabLoaded=false;
  this.clearBadge();
  this.listeners = [];
}

Cloudinary.prototype.syncBackground= function (method,originArgs){
  if (this.executionContext == 'content') {
    var args = [];
    if (originArgs.length>0){
      Array.prototype.push.apply( args, originArgs );
    }
    chrome.runtime.sendMessage({type:'current::method',method:method,args:args})
  }
}

Cloudinary.prototype.syncContent= function (method,originArgs){
  if (this.executionContext == 'background') {
    var args = [];
    if (originArgs.length>0){
      Array.prototype.push.apply( args, originArgs );
    }
    chrome.tabs.sendMessage(this.tabId, {type:'current::method',method:method,args:args});
  }
}
Cloudinary.prototype.badge = function(text,color){
  this.syncBackground('badge',arguments)
  if (!this.isActive()){
    return;
  }
  text = text || '';
  chrome.browserAction.setBadgeText({text: text.toString()});
  if (typeof(color)!='undefined'){
    chrome.browserAction.setBadgeBackgroundColor({tabId: this.tabId,color:color});
  }
};


Cloudinary.prototype.clearBadge = function(){
  this.badge('',"#cccccc")
}

Cloudinary.prototype.notify= function(res){
  if (res && res.containsErrors()){
    this.log(res.errorMessage(),res.url);
  }
  if (this.hasErrors()){
    this.badge(this.errors().length,'#FF0000');
  }else if (this.hasCloudinaries()){
    this.badge(this.cloudinaries().length,'#29a729');
  }else {
    this.badge(this.images().length,'#cccccc');
  }
  if (this.tabLoaded){
    this.updateContentState()
  }
}

Cloudinary.prototype.find =function(match){
  return this._images.filter(function(image){
    if (image==null){ return false; }
    if (image.url.indexOf(match)>-1) { return true ;}
    for (var key in image.responseHeaders){
      var header = image.responseHeaders[key] ;
      if (typeof(header)=='string' && header.indexOf(match)>-1) { return true ;}
    }
    return false;
  })
}

Cloudinary.prototype.images = function(index){
  var allImages= this._images;
  if (isFinite(index)){
    return allImages[index];
  } else if (typeof(index)=="string") {
    var results = allImages.filter(function(image){ return image.hash()==index});
    if (results!=null){
      return results[0];
    }
    return results;
  }
  return allImages;
}

Cloudinary.prototype.errors = function(index){
  var allErrors= this._images.filter(function(image){ return image.containsErrors()});
  if (isFinite(index)){
    return allErrors[index];
  }
  return allErrors;
}

Cloudinary.prototype.hasErrors = function(){
  return this.errors().length>0;
}
Cloudinary.prototype.hasCloudinaries = function(){
  return this.cloudinaries().length>0;
}


Cloudinary.prototype.cloudinaries = function(index){
  var allCloudinaries= this._images.filter(function(image){ return image.isCloudinary()});
  if (index){
    return allCloudinaries[index];
  }
  return allCloudinaries;
}

Cloudinary.prototype.cached= function(index){
  return this._cached_images;
}

Cloudinary.prototype.preloadCachedImagesHeaders = function(){
  var tab= this;
  var itemsLoaded =0 ; 
  this._cached_images.reduce(function(url){
    return tab.find(url).length>0;
  })
  this.cached().forEach(function(url){
    var img = Image.fromUrl(url);
    img.addListener('headers-loaded',function(e){
      tab.addImage(img) ;
      tab.notify(img);
      itemsLoaded++;
      if (itemsLoaded==tab.cached().length){
        tab.emit('cache_loaded',{});
      }
    })
  });
}
Cloudinary.prototype.addCachedImage = function(url){
  if ( this._cached_images.indexOf(url) >-1 ) { return ;}
  this._cached_images.push(url)
  this.syncBackground('addCachedImage',arguments)
}
Cloudinary.prototype.addImage= function(res){
  if (!(res instanceof Image)){
    res = Image.fromJSON(res);
  }
  this.syncBackground('addImage',arguments)
  this._images.push(res);
}

Cloudinary.prototype.getHighlightStatus = function(){
  return this.highlightElements;
}
Cloudinary.prototype.toggleElementsHighlight = function(status){
  if (status!=null){
    this.highlightElements =status;
  }else{
    this.highlightElements =!this.highlightElements;
  }
  if (this.executionContext=='content'){
    Content.toggleHighlight(this.highlightElements)
  }else{
    this.syncContent('toggleElementsHighlight',arguments)
  }
}

Cloudinary.prototype.log = function(message,url){
  if (!chrome.tabs){ return; }
  var request = {type: "log",message:message,url:url}
  console.log('log: request' ,this.tabId, request);
  chrome.tabs.sendMessage(this.tabId,request, function(response) {
    console.log('log: response' ,response);
  });
}

Cloudinary.prototype.isActive = function(){
  return Cloudinary.activeTabId==this.tabId;
}

Cloudinary.prototype.updateContentState= function(){
  if (this.executionContext!='background') { return ;}
  if (this.imagesReportedToContent==this._images.length){ return; }
  this.imagesReportedToContent = this._images.length;
  var request = {type:'data',data:this};
  chrome.tabs.sendMessage(this.tabId,request, function(response) {});
}

Cloudinary.prototype.notifyLoadComplete= function(){
  if (this.executionContext!='background') { return ;}
  this.tabLoaded=true;
  var request = {type:'tabLoaded'};
  chrome.tabs.sendMessage(this.tabId,request, function(response) {});
}
Cloudinary.getTab = function(tabId){
  if (tabId<0){
    throw new Error("tab id can't be lower then 0")
  }
  if (!Cloudinary.tabs[tabId]){
    Cloudinary.tabs[tabId] = new Cloudinary(tabId);
  }
  return Cloudinary.tabs[tabId];
}

Cloudinary.removeTab = function(tabId){
  if (Cloudinary.hasTab(tabId)){
    Cloudinary.tabs[tabId] = null;
    return true;
  }
  return false;
}
Cloudinary.hasTab = function(tabId){
  var result = Cloudinary.tabs[tabId]!=null
  console.log('has tab ? ',result)
  return result; 
}

Cloudinary.setCurrent= function(tabId){
  Cloudinary.activeTabId = tabId;
  return Cloudinary.getTab(tabId)
}

Cloudinary.getCurrent = function(){
  if (!Cloudinary.activeTabId){
    throw new Error('activeTabId was not set')
  }
  return Cloudinary.getTab(Cloudinary.activeTabId);
}

Cloudinary.defaults = {
  overlay:{
    overlay_image_metadata:true,
    overlay_cloudinary_metadata:true,
    overlay_cloudinary_errors:true
  }
}

Cloudinary.fromJSON = function(data){
  var c = new Cloudinary(1);
  for (var attr in data) {
    c[attr]= data[attr];
  }
  c._images= [];
  for (var i = 0, l = data._images.length; i < l; i ++) {
    var v = data._images[i];
    c._images.push(Image.fromJSON(v))
  }
  return c;
}
Cloudinary.tabs = {}


Cloudinary.prototype.addListener = function(event,listener){
  if (this.listeners[event]==null){
    this.listeners[event] = [];
  }
  this.listeners[event].push(listener)
}

Cloudinary.prototype.removeListener = function(event,listener){
  if (this.listeners[event]==null){
    return;
  }
  this.listeners[event] = this.listeners[event].filter(function(_listener){ if (_listener!=listener) return _listener})
}

Cloudinary.prototype.emit= function(event,data){
  if (this.listeners[event]){
    this.listeners[event].forEach(function(subscriber){
      subscriber(data,this);
    },this);
  }
}
