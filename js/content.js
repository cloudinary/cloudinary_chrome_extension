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
      setupMarkerElement();
      //var elements = document.getElementsByTagName('img');
      //for (var i = 0, l = elements.length; i < l; i ++) {
        //var element = elements[i];
        //var res = Image.fromElement(element);
        //var cldnry = document.createElement("div");
        //cldnry.style.width = '20px'
        //cldnry.style.height= '20px'
        //cldnry.style.backgroundColor= 'red'
        //cldnry.style.backgroundColor= 'red'
        //cldnry.style.top= '-20px'
        //cldnry.style.left= '-20px'
        //cldnry.style.marginLeft= '-20px'
        //cldnry.style.marginBottom= '-20px'

        //element.parentNode.insertBefore(cldnry,element.nextSibling);
        
        //res.addListener('headers-loaded',function(data,sender){
          //tab.addImage(sender);
          //if (sender.isCloudinary()){
            //tab.notify(sender);
            //if (sender.containsErrors()){
              //logError(sender.url,sender.errorMessage());
            //}
          //}
        //})
      //}
    }
  }
  function setupMarkerElement(){
    if (!document.getElementById('CLOUDINARY_HIGHLIGHTS')){
      var body = document.getElementsByTagName('body')[0];
      var div = document.createElement('div');
      div.id = 'CLOUDINARY_HIGHLIGHTS'
      body.insertBefore(div,body.childNodes[0]);
    }
  }

  function highlightErrorsOnPage(){

    document.getElementById('CLOUDINARY_HIGHLIGHTS').innerHTML = "";
    for (var i=0;i<tab.errors().length;i++){
      error = tab.errors()[i]
      var elements = document.querySelectorAll('[src="'+error.url+'"]');
      highlightErrorOnelements(elements,error);
    }
    var highlights = document.querySelectorAll('.clodinary.err');
    for (var i=0;i<highlights.length;i++){
      highlights[i].style.border='1px solid red'
    }
  }

  function highlightErrorOnelements(elements,error){
    var template='<div style="width:#{w}px;height:#{h}px;top:#{t}px;left:#{l}px;display:block;position:absolute;border:0px solid white;transition: border-color 2s linear;" class="clodinary err"></div>'
    var highlights = '';
    for (var i = 0, l = elements.length; i < l; i ++) {
      var elm = elements[i];
      highlights += template.replace('#{w}',elm.offsetWidth)
                              .replace('#{h}',elm.offsetHeight)
                              .replace('#{t}',elm.offsetTop)
                              .replace('#{l}',elm.offsetLeft)
    }
    document.getElementById('CLOUDINARY_HIGHLIGHTS').innerHTML += highlights;
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

})(this);
