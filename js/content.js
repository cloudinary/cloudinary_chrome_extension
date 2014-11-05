(function(){
  var tab;
  var layoutOptions;
  var pluginEnabled = true;


  chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
    if(request.type == "log") {
      logError(request.message,request.url)
    } else if(request.type == "data") {
      tab = Cloudinary.fromJSON(request.data);
      tab.executionContext = 'content'
      init('data');
    } else if (request.type == "highlight_errors"){
      markImageContainingElements();
      augmentHostPage();
    } else {
      console.log('unhandled request',request)
    }
  })


  document.addEventListener("DOMContentLoaded", function(event) {
    //markImageContainingElements();
    init('doc_loaded');
  });

  function markImageContainingElements(){
    var elements = document.getElementsByTagName('*')
    var type="";
    for (var i = 0, l = elements.length; i < l; i ++) {
      var element = elements[i];
      var computedStyle = window.getComputedStyle(element);
      var imageUrl;
      if (element.nodeName=='IMG'){
        imageUrl = element.src;
        type = 'image';
      }else{
        imageUrl  = window.getComputedStyle(element).getPropertyValue("background-image");
        if (imageUrl=="none") {
          imageUrl = null
        } else {
          imageUrl = imageUrl.match(/(?:\([\",\']?)(.*)(?:[\",\']?\))/)[1];
        type = 'background';
        };
      }
      if (imageUrl){
        markHtmlElement(element,imageUrl,type);
      }
    }
  }


  function markHtmlElement(element,imageUrl,type){
    if (imageUrl.indexOf(':')<0){
      imageUrl = document.location.origin + imageUrl;
    }
    element.setAttribute('data-cld-image-abs-url',imageUrl)
    element.setAttribute('data-cld-type',type)
  }

  var stages = []
  function init(stage){
    stages.push(stage)
  }

  function augmentHostPage(){
    if (!document.getElementById('CLOUDINARY')){
      var body = document.getElementsByTagName('body')[0];
      var div = document.createElement('div');
      div.id = 'CLOUDINARY'
      div.setAttribute("id","CLOUDINARY")
      div.setAttribute("class","CLOUDINARY")

      var info = document.createElement('div');
      info.id="CLOUDINARY_INFO";
      info.setAttribute('id',"CLOUDINARY_INFO")
      info.setAttribute('class',"CLOUDINARY_INFO")

      body.insertBefore(div,body.childNodes[0]);
      body.insertBefore(info,div);
    }
    //highlightErrorsOnPage();
    highlightImagesOnPage();

  }

  function highlightImagesOnPage(){
    var container = document.getElementById('CLOUDINARY')
    container.innerHTML = "";
    for (var i=0;i<tab.images().length;i++){
      image = tab.images(i)
      var elements = document.querySelectorAll('[data-cld-image-abs-url="'+image.url+'"]');
      highlightImageElement(elements,image,container);
    }
  }

  function highlightImageElement(elements,image,container){
    var styleTemplate = "width:#{w}px;height:#{h}px;top:#{t}px;left:#{l}px;"
    var bodyRect = document.body.getBoundingClientRect();
    for (var i = 0, l = elements.length; i < l; i ++) {
      var elm = elements[i];
      var boudingBox = elm.getBoundingClientRect();
      var highlight = document.createElement('div');
      var cssClass = "image-info-container "
      if (image.isCloudinary()){
        cssClass+='image-cloudinary ';
      }
      if (image.containsErrors()){
        cssClass+='image-error ';
      }
      elm.setAttribute('data-cld-hash',image.hash());
      highlight.setAttribute('data-cld-hash',image.hash());
      highlight.setAttribute('class',cssClass);
      highlight.setAttribute('style', styleTemplate.replace('#{w}',boudingBox.width)
                             .replace('#{h}',boudingBox.height)
                             .replace('#{t}',boudingBox.top - bodyRect.top)
                             .replace('#{l}',boudingBox.left - bodyRect.left));
                             container.insertBefore(highlight,container.childNodes[0]);
      highlight.addEventListener('mouseout',function(event){
        var alt = document.getElementById("CLOUDINARY_INFO");
        alt.style.display = "none";
        alt.innerHTML = "";
      },false);
      highlight.addEventListener('mouseover',function(event){
        var bodyRect = document.body.getBoundingClientRect();
        var imageHash = event.target.getAttribute('data-cld-hash');
        var image  = tab.images(imageHash);
        image.imageDimensions(elm);

        var boudingBox = event.target.getBoundingClientRect();
        var alt = document.getElementById("CLOUDINARY_INFO");
        alt.style.display = "block";
        alt.style.top =  (boudingBox.top + boudingBox.height - bodyRect.top )+"px";
        alt.style.left = (boudingBox.left + boudingBox.width - bodyRect.left )+"px";
        alt.innerHTML = imageInfo(image);

      },false)
    }
  }

  function imageInfo(image){
    var html= "";
    html+='<img src="'+image.url+'" alt="" width="50" style="float:right;opacity:0.5"/>'
    html+="<h1>"+image.fileName()+"</h1>"
    html+='<div style="clear:both"></div>'
    if (image.getSize().bytes>0){
      html+=image.getSize().formatted+"<br/>";
    }
    if (image.getDimensions().actual.width!=null){
      html+=image.getDimensions().formatted;
    }
    html+='<hr/>'
    var essentialHeaders = ["Content-Type","ETag","Last-Modified","Server","Cache-Control","Date"];
    for (var i=0;i< essentialHeaders.length ;i++){
      var attr=essentialHeaders[i];
      html+= "<b>"+attr+"</b> : "+image.responseHeaders[attr];
      html+='<br/>'
    }
    return html;
  }

  function logError(url,message,element){
    console.group("%cCloudinary X-Cld-Error","color:red ;background-color:yellow")
    console.log(message)
    if (element){
      console.log("%o",element)
    }else{
      var elements = document.querySelectorAll('[src="'+url+'"]');
      for (var i = 0, l = elements.length; i < l; i ++) {
        var element = elements[i];
        console.log("%o",element)
      }
      if (elements.length==0){
        console.log("%o",url)
      }
    }
    console.groupEnd();
  }

  function updateOverlay(){
    if (pluginEnabled){
      document.getElementById("CLOUDINARY").style.display='block';
      document.getElementById("CLOUDINARY_INFO").style.display='block';
    }else{
      document.getElementById("CLOUDINARY").style.display='none';
      document.getElementById("CLOUDINARY_INFO").style.display='none';
    }
  }

  function itterateOverPageImages(){
    var elements = document.getElementsByTagName('img');
    for (var i = 0, l = elements.length; i < l; i ++) {
      var res = Image.fromElement(element);

      res.addListener('headers-loaded',function(data,sender){
        tab.addImage(sender);
        if (sender.isCloudinary()){
          tab.notify(sender);
          if (sender.containsErrors()){
            logError(sender.url,sender.errorMessage());
          }
        }
      })
    }
  }

})(this);

