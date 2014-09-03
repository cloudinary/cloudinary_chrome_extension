var Response = function(asset){
  this.asset= asset;
}

Response.prototype.containsErrors = function(){
  var hasError = false;
  var names = this.asset.responseHeaders.map(function(header){ return header.name });
  hasError = names.indexOf('X-Cld-Error')>-1;
  if (hasError){
    this.errorMessage= this.asset.responseHeaders.filter(function(item){if (item.name=='X-Cld-Error') return true})[0].value;
    //console.log('X-Cld-Error '+this.errorMessage.split("http:")[0]);
  }
  return hasError;
}

Response.prototype.isCloudinary = function(){
  var isCloudinary = this.asset.responseHeaders.filter(function(header){ return header.name=='Server' && header.value=='cloudinary' }).length==1;
  return isCloudinary;
}


