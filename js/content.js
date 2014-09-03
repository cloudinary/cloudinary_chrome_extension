(function(){
  var tab,pageImages;

  chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
    if(request.type == "log") {
      console.group("%cCloudinary X-Cld-Error","color:red ;background-color:yellow")
      console.log(request.message)
      var elements = document.querySelectorAll('[src="'+request.asset.url+'"]');
      for (var i = 0, l = elements.length; i < l; i ++) {
        var element = elements[i];
        console.log("%o",element)
      }
      if (elements.length==0){
        console.log("%o",request.asset.url)
      }
      console.groupEnd();
      if (sendResponse) sendResponse({handled: true});
    }
    if(request.type == "data") {
      tab = Cloudinary.fromJSON(request.data);
      console.dir(tab)
      console.dir(tab.cloudinaries())
      init('data');
    }
  })


  document.addEventListener("DOMContentLoaded", function(event) {
    init('doc_loaded');
  });

  var stages = []
  function init(stage){
    stages.push(stage)
    if (stages.length>=2){
      pageImages= document.getElementsByTagName('img');
      for (var i = 0, l = pageImages.length; i < l; i ++) {
        
        //tab.images
        //var v = pageImages[i];
        //v.style.border="1px solid red"
      }
    }
  }

})(this);
