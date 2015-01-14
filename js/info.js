
var Cloudinary,subject,tab;
function preload(){
  
  chrome.runtime.getBackgroundPage(function(backgroundPage){
    Cloudinary = backgroundPage.Cloudinary;
    subject = Cloudinary.getTab(getParameterByName('tabId'))
    chrome.tabs.get(subject.tabId,function(res){
      tab = res;
      refresh_images();
    })
      
  })
  $("#term").keyup(function(){
    refresh_images();
  })
  $(".image_filter").click(function(){
    refresh_images();
  })
}

function refresh_images(){
  var term = document.getElementById('term').value;
  var is_cloudinary= document.getElementById('is_cloudinary').checked;
  var is_errors= document.getElementById('is_errors').checked;
  var is_other= document.getElementById('is_other').checked;

  document.getElementById('pageTitle').innerHTML = "Images for "+tab.url;
  var template = document.getElementById("imageTemplate").innerHTML;
  var html = ""
  subject.images().filter(function(image){ 
    return term=="" ? true : image.url.indexOf(term)>0
  }).forEach(function(image){
    if (image.isCloudinary()){
      if (!image.containsErrors() && is_cloudinary){
        html+=template.replace(/\{url\}/g,image.url).replace(/\{file_name\}/g,image.fileName());
      }else {
        if (is_errors){
          html+=template.replace(/\{url\}/g,image.url).replace(/\{file_name\}/g,image.fileName());
        }
      }
    }else{
      if (is_other){
          html+=template.replace(/\{url\}/g,image.url).replace(/\{file_name\}/g,image.fileName());
      }
    }
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
