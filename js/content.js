(function(){
  var tab;

  chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
    if(request.type == "log") {
      logError(request.message,request.url)
    } else if(request.type == "data") {
      tab = Cloudinary.fromJSON(request.data);
      tab.executionContext = 'content'
      init('data');
    } else if (request.type == "highlight_errors"){
      highlightErrorsOnPage();
    } else {
      console.log('unhandled request',request)
    }
  })


  document.addEventListener("DOMContentLoaded", function(event) {
    init('doc_loaded');
  });

  var stages = []
  function init(stage){
    stages.push(stage)
    if (stages.length>=2){
      augmentHostPage();
      //itterateOverPageImages();
    }
  }

  function augmentHostPage(){
    if (!document.getElementById('CLOUDINARY')){
      var body = document.getElementsByTagName('body')[0];
      var div = document.createElement('div');
      div.id = 'CLOUDINARY'
      div.setAttribute("id","CLOUDINARY")
      div.setAttribute("class","CLOUDINARY")
      body.insertBefore(div,body.childNodes[0]);
    }
  }

  function highlightErrorsOnPage(){
    var container = document.getElementById('CLOUDINARY')
    container.innerHTML = "";
    console.log('creating elements')
    for (var i=0;i<tab.errors().length;i++){
      error = tab.errors()[i]
      var elements = document.querySelectorAll('[src="'+error.url+'"]');
      highlightErrorOnelements(elements,error,container);
    }
  }

  function highlightErrorOnelements(elements,error,container){
    var styleTemplate = "width:#{w}px;height:#{h}px;top:#{t}px;left:#{l}px;"
    for (var i = 0, l = elements.length; i < l; i ++) {
      var elm = elements[i];

      var highlight = document.createElement('div');
      highlight.setAttribute('class','image-info-container');
      highlight.setAttribute('style', styleTemplate.replace('#{w}',elm.offsetWidth)
                             .replace('#{h}',elm.offsetHeight)
                             .replace('#{t}',elm.offsetTop)
                             .replace('#{l}',elm.offsetLeft));
                             container.insertBefore(highlight,container.childNodes[0]);
    }
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
