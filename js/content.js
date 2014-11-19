var tab;
var layoutOptions;
var pluginEnabled = true;

var Content = {
  documentLoaded: false
};

Content.toggleHighlight = function(highlight) {
  if (highlight) {
    augmentHostPage();
    markImageContainingElements();
    highlightImagesOnPage();
  } else {
    Array.prototype.slice.call(document.querySelectorAll( ".image-info-container")).forEach(function(item) { item.parentNode.removeChild(item) });
    var info = document.getElementById('CLOUDINARY_INFO');
    if (info) {
      info.parentNode.removeChild(info);
    }
  }
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type == "log") {
    logError(request.message, request.url)
  } else if (request.type == "data") {
    tab = Cloudinary.fromJSON(request.data);
    tab.executionContext = 'content'
    markImageContainingElements();
    createOrphanImageObjects();
  } else if (request.type == "tabLoaded") {
    setTimeout(function() {
      Content.toggleHighlight(tab.getHighlightStatus());
    }, 2000);
  } else if (request.type == 'current::method') {
    if (tab) {
      tab[request.method].apply(tab, request.args);
    }
  } else {
    console.log('unhandled request', request)
  }
})


function createOrphanImageObjects() {
  var orphans = document.querySelectorAll('[data-cld-orphan="true"]');
  for (var i = 0; i < orphans.length; i++) {
    orphans[i].removeAttribute('data-cld-orphan');
    tab.addCachedImage(orphans[i].getAttribute('data-cld-image-abs-url'));
  }
}


function markImageContainingElements() {
  var elements = document.getElementsByTagName('*')
  var type = "";
  for (var i = 0, l = elements.length; i < l; i++) {
    var element = elements[i];
    var computedStyle = window.getComputedStyle(element);
    var imageUrl;
    if (element.nodeName == 'IMG') {
      imageUrl = element.src;
      type = 'src';
      markHtmlElement(element, imageUrl, type);
    } else {
      ["background-image"].forEach(function(styleAttribute) {
        imageUrl = extractCssUrl(window.getComputedStyle(element).getPropertyValue( styleAttribute));
        type = styleAttribute;
        if (imageUrl) {
          markHtmlElement(element, imageUrl, type);
        }
      });
    }
  }
}


function extractCssUrl(input) {
  if (input.indexOf('://')<0) return null;
  if (input == null) { return null; }
  matches = input.match(/(?:\([\",\']?)(.*)(?:[\",\']?\))/)
  if (!Array.isArray(matches)) { return null; }
  return matches[1]
}

function markHtmlElement(element, imageUrl, type) {
  var imgObj = tab.find(imageUrl)[0]
  if (imageUrl.indexOf(':') < 0) {
    imageUrl = document.location.origin + imageUrl;
  }
  if (imgObj == null) {
    element.setAttribute('data-cld-orphan', 'true')
  }
  element.setAttribute('data-cld-image-abs-url', imageUrl)
  element.setAttribute('data-cld-type', type)
}

function augmentHostPage() {
  if (!document.getElementById('CLOUDINARY_INFO')) {
    var body = document.body;
    var info = document.createElement('div');
    info.id = "CLOUDINARY_INFO";
    info.setAttribute('id', "CLOUDINARY_INFO")
    info.setAttribute('class', "CLOUDINARY_INFO")

    body.insertBefore(info, body.childNodes[0]);
  }

}

function highlightImagesOnPage() {
  tab.images().forEach(function(image) {
    var elements = document.querySelectorAll('[data-cld-image-abs-url="' + image.url + '"]');
    highlightImageElement(elements, image);
  })
}

function highlightImageElement(elements, image) {
  var styleTemplate = "width:#{w}px;height:#{h}px;top:#{t}px;left:#{l}px;"
  var bodyRect = document.body.getBoundingClientRect();
  for (var i = 0, l = elements.length; i < l; i++) {
    var elm = elements[i];
    var boudingBox = elm.getBoundingClientRect();
    var parentBox = elm.parentNode.getBoundingClientRect();
    var highlight = document.createElement('div');
    var cssClass = "image-info-container "
    if (image.isCloudinary()) {
      cssClass += 'image-cloudinary ';
    }
    if (image.containsErrors()) {
      cssClass += 'image-error ';
    }
    elm.setAttribute('data-cld-hash', image.hash());
    highlight.setAttribute('data-cld-hash', image.hash());
    highlight.setAttribute('class', cssClass);
    var top = 0 ,left = 0 ;
    var traversalNode= elm;
    var parseOffsetParent = true 
    var deep=0;
    while(parseOffsetParent==true){
      parseOffsetParent= false;
      top += traversalNode.offsetTop;
      left += traversalNode.offsetLeft;
      var parent = traversalNode.offsetParent;
      deep++;
      if (parent){
        parseOffsetParent = window.getComputedStyle(parent).getPropertyValue("position") == 'static' && deep<100;
        traversalNode = parent;
      }
    }
    highlight.setAttribute('style', styleTemplate.replace('#{w}', boudingBox.width)
      .replace('#{h}', boudingBox.height)
      .replace('#{t}', top)
      .replace('#{l}', left));

    if (elm.parentNode){
      elm.parentNode.insertBefore(highlight, elm.nextSibling);
    }else{
      console.log('cant find parent element')
    }
    highlight.addEventListener('mouseover', function(event) {
      var bodyRect = document.body.getBoundingClientRect();
      var imageHash = event.target.getAttribute('data-cld-hash');
      var image = tab.images(imageHash);
      image.imageDimensions(elm);

      var boudingBox = event.target.getBoundingClientRect();
      var alt = document.getElementById("CLOUDINARY_INFO");
      alt.style.display = "block";
      alt.innerHTML = imageInfo(image);

    }, false)
  }
}

function imageInfo(image) {
  var html = "";
  //html+='<div style="float:right;opacity:0.5;width:70px;height:100px;overflow:hidden"><img src="'+image.url+'" alt=""/></div>'
  html += '<a class="resourceLink" href="' + image.url + '" target="_blank">' + image.fileName() + '</a>'
  if (image.isCloudinary()) {
    html += '<div class="image-cloudinary cloudinary-icon"></div>';
  }
  if (image.containsErrors()) {
    html += '<div class="error">' + image.errorMessage() + '</div>';
  }
  html += '<div class="dimensions">Dimensions: ';
  if (image.getSize().bytes > 0) {
    html += image.getSize().formatted + '<br/>';
  }
  if (image.getDimensions().actual.width != null) {
    html += image.getDimensions().formatted;
  }
  html += '</div>';

  html += '<div class="headers">'
  var essentialHeaders = ['ETag', 'Last-Modified', 'Cache-Control', 'Date'];
  for (var i = 0; i < essentialHeaders.length; i++) {
    var attr = essentialHeaders[i];
    html += '<b>' + attr + '</b> : ' + image.responseHeaders[attr];
    html += '<br/>'
  }
  html += '</div>'
  html += '<div style="float:right"><a style="color:red" href="#" onclick="document.getElementById(\'CLOUDINARY_INFO\').style.display=\'none\';return false">close</a></div>'
  return html;
}

function logError(message, url, element) {
  console.group("%cCloudinary X-Cld-Error", "color:red ;background-color:yellow")
  console.log(message)
  if (element) {
    console.log("%o", element)
  } else {
    var elements = document.querySelectorAll('[src="' + url + '"]');
    for (var i = 0, l = elements.length; i < l; i++) {
      var element = elements[i];
      console.log("%o", element)
    }
    if (elements.length == 0) {
      console.log("%o", url)
    }
  }
  console.groupEnd();
}

document.addEventListener("DOMContentLoaded", function(event) {
  Content.documentLoaded = true;
});
