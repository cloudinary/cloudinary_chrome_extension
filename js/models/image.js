var Image = function(url){
  this.url = url;
  this.listeners = [];
}

Image.fromDetails = function(details){
  var res = new Image(details.url);
  //TODO: __details__ refference should be removed when stablelized
  //res.__details__ = details;
  res.parseResponseHeaders(details.responseHeaders);
  return res;
}

Image.fromElement= function(image){
  var res = new Image(image.src);
  //TODO: __image__ refference should be removed when stablelized
  //res.__image__= image;
  res.parseResponseHeaders();
  res.imageDimensions(image);
  return res;
}

Image.prototype.imageDimensions = function(image){
  this.dimensions = { width: image.width, height:image.height}
  this.naturalDimensions = { width: image.naturalWidth, height:image.naturalHeight}
}

Image.fromJSON = function(json){
  var res = new Image();
  for (var attr in json) {
    res[attr]= json[attr];
  }
  return res;
}

Image.prototype.parseResponseHeaders= function(responseHeaders){
  if (responseHeaders==null) {
    responseHeaders = [];
  }
  this.responseHeaders = {}
  for (var i = 0, l = responseHeaders.length; i < l; i ++) {
    var v = responseHeaders[i];
    this.responseHeaders[v.name]= v.value;
  }
  if (this.getHeader('Content-Length')==null){
    this.reloadHeaders();
  } else { 
    var self = this;
    setTimeout(function(){ self.emit('headers-loaded') },10);
  }
}

Image.prototype.reloadHeaders= function(){
  var req = new XMLHttpRequest();
  req.open("HEAD", this.url, true);
  var self= this;
  req.onreadystatechange = function(data) {
    if (this.readyState==4){
      self.addXhrHeaders.call(self,this);
    }
  };
  req.send(null);
}

Image.prototype.addXhrHeaders = function(xhr){
  var allHeaders = xhr.getAllResponseHeaders();
  if (allHeaders!=null){
    allHeaders = allHeaders.split('\n');
    allHeaders = allHeaders.map(function(header){return header.split(/\: (.+)/)})
    allHeaders.forEach(function(header){
      this.responseHeaders[header[0]] = header[1]
    },this)
  }
  this.emit('headers-loaded')
}

Image.prototype.addListener = function(event,listener){
  if (this.listeners[event]==null){
    this.listeners[event] = [];
  }
  this.listeners[event].push(listener)
}

Image.prototype.removeListener = function(event,listener){
  if (this.listeners[event]==null){
    return;
  }
  this.listeners[event] = this.listeners[event].filter(function(_listener){ if (_listener!=listener) return _listener})
}

Image.prototype.emit= function(event,data){
  if (this.listeners[event]){
    this.listeners[event].forEach(function(subscriber){
      subscriber(data,this);
    },this);
  }
}

Image.prototype.getHeader= function(name){
  return this.responseHeaders[name];
}

Image.prototype.statusCode= function(format){
  var code = this.getHeader('Status')
  if (code==null){
    code = "0";
  }else{
    code = code.split(' ')[0];
  }
  return code;
}

Image.prototype.getSize = function(format){
  var bytes = this.getHeader('Content-Length');
  var size = bytes;
  var unit = 'bytes'
  if (size>1024){
    size = (size / 1024).toFixed(2);
    unit='kb';
  }
  if (size>1024){
    size = (size / 1024).toFixed(2);
    unit='mb';
  }
  return {bytes:bytes,formatted: size+' '+unit};
}

Image.prototype.errorMessage = function(){
  return this.getHeader('X-Cld-Error');
}
Image.prototype.containsErrors = function(){
  var hasError = false;
  var errorMessage= this.getHeader('X-Cld-Error')
  if (errorMessage!=null){
    hasError=true
  }
  return hasError;
}

Image.prototype.isCloudinary = function(){
  var isCloudinary = this.getHeader('Server') == 'cloudinary'
  return isCloudinary;
}


