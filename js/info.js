
var Cloudinary,subject,tab;
function preload(){
  
  chrome.runtime.getBackgroundPage(function(backgroundPage){
    Cloudinary = backgroundPage.Cloudinary;
    subject = Cloudinary.getTab(getParameterByName('tabId'))
    chrome.tabs.get(subject.tabId,function(res){
      tab = res;
      init();
    })
      
  })
}

function init(){
  document.getElementById('pageTitle').innerHTML = "Images for "+tab.url;
  var template = document.getElementById("imageTemplate").innerHTML;
  var html = ""
  subject.images().forEach(function(image){
  console.log(1)
    html+=template.replace(/\{url\}/g,image.url);
  })
  document.getElementById('images').innerHTML = html;
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}


window.addEventListener("DOMContentLoaded", preload, false);
