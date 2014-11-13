var Cloudinary,tab;
function preload(){
  
  var tabInfoLink = document.getElementById('tabInfoLink');
  chrome.runtime.getBackgroundPage(function(backgroundPage){
    Cloudinary = backgroundPage.Cloudinary;
    try{
      tab = Cloudinary.getCurrent()
      tab.preloadCachedImagesHeaders();
      tabInfoLink.setAttribute('href',tabInfoLink.getAttribute('data-url').replace("{id}",tab.tabId))
    }catch(e){
      console.log(e)
    }
    init();
  })
}

function init(){
  document.getElementById("toggleHighlight").addEventListener('change',function(e){
    tab.toggleElementsHighlight(e.target.checked)
  })
  document.getElementById("toggleHighlight").checked = tab.getHighlightStatus();
  var counter = document.getElementById('counter');
  var errorsHTML = ""
  for (var i = 0, l =tab.errors().length; i < l; i ++) {
    var err = tab.errors(i);
    errorsHTML+=errorTemplate(err,i);
  }

  var total = 0;
  tab.images().forEach(function(image){
    total += image.getSize().bytes*1;
  })

  document.getElementById("imageCount").innerHTML = tab.images().length
  document.getElementById("totalSize").innerHTML = (total/1024).toFixed(2) + " kb";
  document.getElementById("cloudinaryCount").innerHTML = tab.cloudinaries().length
  document.getElementById("errorCount").innerHTML = tab.errors().length
  document.getElementById("cacheCount").innerHTML = tab.cached().length
  document.getElementById('errors-container').innerHTML = errorsHTML;
}

function errorTemplate(error,index){
  var url = error.url;
  var html =''
  var filename = url.substring(url.lastIndexOf('/')+1);
  
  html+= '<div class="err-img"><img src="'+url+'" width="24" height="24" alt="'+filename+'"/></div>'
  html+= '<div class="err-filename">'+filename+'</div>'
  html+= '<div class="err-msg">'+error.errorMessage()+'</div>'
  html += '<div class="err-delimiter"></div>'
  return html;
}

window.addEventListener("DOMContentLoaded", preload, false);
