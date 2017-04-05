// Saves options to chrome.storage.sync.
function save_options() {
  var autoOpenSite = document.getElementById('site').value;
//   var likesColor = document.getElementById('like').checked;
  chrome.storage.sync.set({
    autoOpenSite: autoOpenSite
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
    var status = document.getElementById('status');
    var btnSave = document.getElementById('save');
    chrome.permissions.request({
        permissions:['storage']
    }, granted =>{
        if (granted){
            btnSave.addEventListener('click', save_options);
        } else {
            btnSave.style.display = 'none';
            status.textContent = 'Storage permission is required to save options';
        }
    });
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get({
    site: 'cotli'
  }, function(items) {
    document.getElementById('site').value = items.site;
    // document.getElementById('like').checked = items.likesColor;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);