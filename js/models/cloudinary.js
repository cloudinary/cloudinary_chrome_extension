var Cloudinary = function(tabId){
  this.tabId = tabId
  this.reset();
};

Cloudinary.prototype.reset = function(size){
  this.images = new Array(); 
  this.clearBadge();
}

Cloudinary.prototype.badge = function(text,color){
  if (!chrome.browserAction){ return; }
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
  this.badge('')
}

Cloudinary.prototype.notify= function(res){
  if (res && res.containsErrors()){
    this.log(res.errorMessage,res.asset);
  }
  
  if (this.hasErrors()){
    this.badge(this.errors().length,'#FF0000');
  }else{
    this.badge(this.cloudinaries().length,'#29a729');
  }
}


Cloudinary.prototype.errors = function(){
  return this.images.filter(function(image){ return image.containsErrors()});
}

Cloudinary.prototype.hasErrors = function(){
  return this.errors().length>0;
}
Cloudinary.prototype.cloudinaries = function(){
  return this.images.filter(function(image){ return image.isCloudinary()});
}
Cloudinary.prototype.addImage= function(res){
  this.images.push(res);
}

Cloudinary.prototype.log = function(message,asset){
  if (!chrome.tabs){ return; }
  var request = {type: "log",message:message,asset:asset}
  console.log('log: request' ,this.tabId, request);
  chrome.tabs.sendMessage(this.tabId,request, function(response) {
    console.log('log: response' ,response);
  });
}

Cloudinary.prototype.isActive = function(){
  return Cloudinary.activeTabId==this.tabId;
}
Cloudinary.prototype.updateContentScript = function(){
  if (!chrome.tabs){ return ;} 
  var request = {type:'data',data:this};
  chrome.tabs.sendMessage(this.tabId,request, function(response) {
  });
}

Cloudinary.getTab = function(tabId){
  if (tabId<0){
    throw new Error("tab id can't be lower then 0")
  }
  if (!Cloudinary.tabs[tabId]){
    //console.log('initializing new context for '+tabId)
    Cloudinary.tabs[tabId] = new Cloudinary(tabId);
  }
  //console.log('context at '+tabId)
  return Cloudinary.tabs[tabId];
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

Cloudinary.fromJSON = function(data){
  var c = new Cloudinary(1);
  for (var attr in data) {
    c[attr]= data[attr];
  }
  c.images= [];
  for (var i = 0, l = data.images.length; i < l; i ++) {
    var v = data.images[i];
    c.images.push(new Response(v.asset))
  }
  return c;
}
Cloudinary.tabs = {}


