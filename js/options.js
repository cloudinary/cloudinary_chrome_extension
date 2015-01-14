function loadOptions() {
  chrome.storage.local.get(Cloudinary.defaults.overlay,function(overlay_options){
    for (var key in overlay_options){
      document.getElementById(key).checked = overlay_options[key];
    }
  });
  chrome.storage.local.get(Cloudinary.defaults.general,function(general_options){
    for (var key in general_options){
      document.getElementById(key).checked = general_options[key];
    }
  });
}

function checkbox_event_listener(event){
  var data = {};
  data[event.target.id] = event.target.checked;
  chrome.storage.local.set(data,function(){
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}
window.onload = function(){
  loadOptions();
  for (var attr in Cloudinary.defaults.overlay){
    document.getElementById(attr).addEventListener('click',checkbox_event_listener);
  }
  for (attr in Cloudinary.defaults.general){
    document.getElementById(attr).addEventListener('click',checkbox_event_listener);
  }
};
