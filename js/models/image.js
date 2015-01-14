
var Image = function(url){
  this.url = url;
  this.cached=false;
  this.listeners = [];
};

Image.prototype.hash= function(){
  if (this._hash) return this._hash;
  this._hash=undefined;
  if (this.url){
    this._hash= CryptoJS.SHA1(this.url);
  }
  return this._hash;
};

Image.prototype.fileName = function(){
  return this.url.substring(this.url.lastIndexOf('/')+1);
};

Image.fromDetails = function(details){
  var res = new Image(details.url);
  res.parseResponseHeaders(details.responseHeaders);
  return res;
};

Image.fromUrl= function(url){
  var res = new Image(url);
  res.reloadHeaders();
  return res;
};

Image.prototype.imageDimensions = function(image){
  this.dimensions = { width: image.width, height:image.height};
  this.naturalDimensions = { width: image.naturalWidth, height:image.naturalHeight};
};

Image.prototype.getDimensions = function(){
  return {actual:this.dimensions,natural:this.naturalDimensions,formatted:"actual "+this.dimensions.width+"x"+this.dimensions.height+" natural "+this.naturalDimensions.width+"x"+this.naturalDimensions.height};
};

Image.fromJSON = function(json){
  var res = new Image();
  for (var attr in json) {
    res[attr]= json[attr];
  }
  return res;
};

Image.prototype.parseResponseHeaders= function(responseHeaders){
  if (responseHeaders===null) {
    responseHeaders = [];
  }
  this.responseHeaders = {};
  for (var i = 0, l = responseHeaders.length; i < l; i ++) {
    var v = responseHeaders[i];
    if(v.name!==null && v.name!==''){
      this.appendHeader(v.name,v.value);
    }
  }
  if (this.getHeader('Server')){
    var self = this;
    setTimeout(function(){ self.emit('headers-loaded'); },10);
  }
};


Image.prototype.headersLoaded = function() {
  return this.responseHeaders && Object.keys(this.responseHeaders).length >0;
};

Image.prototype.reloadHeaders= function(){
  this.responseHeaders = {};
  var req = new XMLHttpRequest();
  req.open("HEAD", this.url, true);
  var self= this;
  req.onreadystatechange = function(data) {
    if (this.readyState==4){
      self.addXhrHeaders.call(self,this);
    }
  };
  req.send(null);
};

Image.prototype.addXhrHeaders = function(xhr){
  var allHeaders = xhr.getAllResponseHeaders();
  if (allHeaders!==null){
    allHeaders = allHeaders.split('\n');
    allHeaders = allHeaders.map(function(header){return header.split(/\: (.+)/);});
    allHeaders.forEach(function(header){
      if(header[0]!==null && header[0]!==''){
        this.appendHeader(header[0],header[1]);
      }
    },this);
  }
  this.emit('headers-loaded');
};

Image.prototype.appendHeader = function(name,value){
  var header_exists = Object.keys(this.responseHeaders).indexOf(name)>0;
  if (header_exists){
    if (!Array.isArray(this.responseHeaders[name])){
      this.responseHeaders[name] = [this.responseHeaders[value]];
    }
    this.responseHeaders[name].push(value);
  }else{
    this.responseHeaders[name] = value;
  }
};

Image.prototype.addListener = function(event,listener){
  if (this.listeners[event]===undefined){
    this.listeners[event] = [];
  }
  this.listeners[event].push(listener);
};

Image.prototype.removeListener = function(event,listener){
  if (this.listeners[event]===undefined){
    return;
  }
  this.listeners[event] = this.listeners[event].filter(function(_listener){ if (_listener!=listener) return _listener;});
};

Image.prototype.emit= function(event,data){
  if (this.listeners[event]){
    this.listeners[event].forEach(function(subscriber){
      subscriber(data,this);
    },this);
  }
};

Image.prototype.getHeader= function(name){
  return this.responseHeaders && this.responseHeaders[name];
};

Image.prototype.statusCode= function(){
  var code = this.getHeader('Status');
  if (code===null){
    code = "0";
  }else{
    code = code.split(' ')[0];
  }
  return code;
};

Image.prototype.getSize = function(){
  var bytes = this.getHeader('Content-Length') || 0;
  var size = bytes;
  var unit = 'bytes';
  if (size>1024){
    size = (size / 1024).toFixed(2);
    unit='kb';
  }
  if (size>1024){
    size = (size / 1024).toFixed(2);
    unit='mb';
  }
  return {bytes:bytes,formatted: size+' '+unit};
};

Image.prototype.getType = function() {
  if (this.containsErrors()) {return "error";}
  if (this.isCloudinary()) {return "cloudinary";}
  return "general";
};

Image.prototype.errorMessage = function(){
  return this.getHeader('X-Cld-Error');
};

Image.prototype.containsErrors = function(){
  if (this._hasError!==undefined) return this._hasError;
  this._hasError = false;
  var errorMessage= this.getHeader('X-Cld-Error');
  if (errorMessage!==null){
    this._hasError=true;
  }
  return this._hasError;
};

Image.prototype.isCloudinary = function(){
  if (this._isCloudinary!==undefined) return this._isCloudinary;
  this._isCloudinary = this.getHeader('Server') == 'cloudinary';
  return this._isCloudinary;
};


/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
var CryptoJS=CryptoJS||function(e,m){var p={},j=p.lib={},l=function(){},f=j.Base={extend:function(a){l.prototype=this;var c=new l;a&&c.mixIn(a);c.hasOwnProperty("init")||(c.init=function(){c.$super.init.apply(this,arguments)});c.init.prototype=c;c.$super=this;return c},create:function(){var a=this.extend();a.init.apply(a,arguments);return a},init:function(){},mixIn:function(a){for(var c in a)a.hasOwnProperty(c)&&(this[c]=a[c]);a.hasOwnProperty("toString")&&(this.toString=a.toString)},clone:function(){return this.init.prototype.extend(this)}},
n=j.WordArray=f.extend({init:function(a,c){a=this.words=a||[];this.sigBytes=c!=m?c:4*a.length},toString:function(a){return(a||h).stringify(this)},concat:function(a){var c=this.words,q=a.words,d=this.sigBytes;a=a.sigBytes;this.clamp();if(d%4)for(var b=0;b<a;b++)c[d+b>>>2]|=(q[b>>>2]>>>24-8*(b%4)&255)<<24-8*((d+b)%4);else if(65535<q.length)for(b=0;b<a;b+=4)c[d+b>>>2]=q[b>>>2];else c.push.apply(c,q);this.sigBytes+=a;return this},clamp:function(){var a=this.words,c=this.sigBytes;a[c>>>2]&=4294967295<<
32-8*(c%4);a.length=e.ceil(c/4)},clone:function(){var a=f.clone.call(this);a.words=this.words.slice(0);return a},random:function(a){for(var c=[],b=0;b<a;b+=4)c.push(4294967296*e.random()|0);return new n.init(c,a)}}),b=p.enc={},h=b.Hex={stringify:function(a){var c=a.words;a=a.sigBytes;for(var b=[],d=0;d<a;d++){var f=c[d>>>2]>>>24-8*(d%4)&255;b.push((f>>>4).toString(16));b.push((f&15).toString(16))}return b.join("")},parse:function(a){for(var c=a.length,b=[],d=0;d<c;d+=2)b[d>>>3]|=parseInt(a.substr(d,
2),16)<<24-4*(d%8);return new n.init(b,c/2)}},g=b.Latin1={stringify:function(a){var c=a.words;a=a.sigBytes;for(var b=[],d=0;d<a;d++)b.push(String.fromCharCode(c[d>>>2]>>>24-8*(d%4)&255));return b.join("")},parse:function(a){for(var c=a.length,b=[],d=0;d<c;d++)b[d>>>2]|=(a.charCodeAt(d)&255)<<24-8*(d%4);return new n.init(b,c)}},r=b.Utf8={stringify:function(a){try{return decodeURIComponent(escape(g.stringify(a)))}catch(c){throw Error("Malformed UTF-8 data");}},parse:function(a){return g.parse(unescape(encodeURIComponent(a)))}},
k=j.BufferedBlockAlgorithm=f.extend({reset:function(){this._data=new n.init;this._nDataBytes=0},_append:function(a){"string"==typeof a&&(a=r.parse(a));this._data.concat(a);this._nDataBytes+=a.sigBytes},_process:function(a){var c=this._data,b=c.words,d=c.sigBytes,f=this.blockSize,h=d/(4*f),h=a?e.ceil(h):e.max((h|0)-this._minBufferSize,0);a=h*f;d=e.min(4*a,d);if(a){for(var g=0;g<a;g+=f)this._doProcessBlock(b,g);g=b.splice(0,a);c.sigBytes-=d}return new n.init(g,d)},clone:function(){var a=f.clone.call(this);
a._data=this._data.clone();return a},_minBufferSize:0});j.Hasher=k.extend({cfg:f.extend(),init:function(a){this.cfg=this.cfg.extend(a);this.reset()},reset:function(){k.reset.call(this);this._doReset()},update:function(a){this._append(a);this._process();return this},finalize:function(a){a&&this._append(a);return this._doFinalize()},blockSize:16,_createHelper:function(a){return function(c,b){return(new a.init(b)).finalize(c)}},_createHmacHelper:function(a){return function(b,f){return(new s.HMAC.init(a,
f)).finalize(b)}}});var s=p.algo={};return p}(Math);
(function(){var e=CryptoJS,m=e.lib,p=m.WordArray,j=m.Hasher,l=[],m=e.algo.SHA1=j.extend({_doReset:function(){this._hash=new p.init([1732584193,4023233417,2562383102,271733878,3285377520])},_doProcessBlock:function(f,n){for(var b=this._hash.words,h=b[0],g=b[1],e=b[2],k=b[3],j=b[4],a=0;80>a;a++){if(16>a)l[a]=f[n+a]|0;else{var c=l[a-3]^l[a-8]^l[a-14]^l[a-16];l[a]=c<<1|c>>>31}c=(h<<5|h>>>27)+j+l[a];c=20>a?c+((g&e|~g&k)+1518500249):40>a?c+((g^e^k)+1859775393):60>a?c+((g&e|g&k|e&k)-1894007588):c+((g^e^
k)-899497514);j=k;k=e;e=g<<30|g>>>2;g=h;h=c}b[0]=b[0]+h|0;b[1]=b[1]+g|0;b[2]=b[2]+e|0;b[3]=b[3]+k|0;b[4]=b[4]+j|0},_doFinalize:function(){var f=this._data,e=f.words,b=8*this._nDataBytes,h=8*f.sigBytes;e[h>>>5]|=128<<24-h%32;e[(h+64>>>9<<4)+14]=Math.floor(b/4294967296);e[(h+64>>>9<<4)+15]=b;f.sigBytes=4*e.length;this._process();return this._hash},clone:function(){var e=j.clone.call(this);e._hash=this._hash.clone();return e}});e.SHA1=j._createHelper(m);e.HmacSHA1=j._createHmacHelper(m)})();
