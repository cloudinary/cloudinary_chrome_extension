function loadOptions() {
  chrome.storage.local.get(Cloudinary.defaults.overlay,function(overlay_options){
    for (var key in overlay_options){
      document.getElementById(key).checked = overlay_options[key];
    }
  });
}

window.onload = function(){
  loadOptions();
  document.getElementById('overlay_enabled').addEventListener('click',function(){
    var enabled = document.getElementById('overlay_enabled').checked
    for (var attr in Cloudinary.defaults.overlay){
      if (attr!='overlay_enabled'){
        document.getElementById(attr).disabled=!enabled;
      }
    }
  })

  for (var attr in Cloudinary.defaults.overlay){
    document.getElementById(attr).addEventListener('click',function(event){
      var data = {}
      data[event.target.id] = event.target.checked;
      chrome.storage.local.set(data,function(){
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function() {
          status.textContent = '';
        }, 750);
      });
    })
  }
}
