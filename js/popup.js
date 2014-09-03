
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
  counter.innerHTML= tab.errors.length;
  if (tab.errors==0){
    counter.setAttribute('class','no-errors')
  }else{
    counter.setAttribute('class','errors-found')
  }
  var errorsHTML = ""
  console.log(tab.errors.length)
  for (var i = 0, l =tab.errors.length; i < l; i ++) {
    var err = tab.errors[i];
    console.log(err)
    errorsHTML+=errorTemplate(err,i);
  }
  console.log(errorsHTML)
  document.getElementById('errors-container').innerHTML = errorsHTML;
}

function errorTemplate(error,index){
  var url = error.asset.url;
  var html =''
  html = '<li>'+error.errorMessage+'</li>'
  return html;
}
window.addEventListener("DOMContentLoaded", preload, false);

