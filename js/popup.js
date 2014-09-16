
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
  var html ='<table border="1"><tr>'
  var filename = url.substring(url.lastIndexOf('/')+1);
  
  html+= '<td><img src="'+url+'" width="30" height="30" alt="'+filename+'"/></td>'
  html+= '<td style="font-weight:bold">'+filename+'</td>'
  html+= '<td style="color:red">'+error.errorMessage()+'</td>'
  html += '</tr></table'
  return html;
}
window.addEventListener("DOMContentLoaded", preload, false);

