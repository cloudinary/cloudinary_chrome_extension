
var Cloudinary,tab;
function preload(){
  chrome.runtime.getBackgroundPage(function(backgroundPage){
    Cloudinary = backgroundPage.Cloudinary;
    tab = Cloudinary.getCurrent();
    init();
  })
}

function init(){
  var counter = document.getElementById('counter');
  var errorsHTML = ""
  console.log(tab.errors().length)
  for (var i = 0, l =tab.errors().length; i < l; i ++) {
    var err = tab.errors()[i];
    console.log(err)
    errorsHTML+=errorTemplate(err,i);
  }
  chrome.tabs.sendMessage(tab.tabId, {type: "highlight_errors"});
  console.log(errorsHTML)
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

