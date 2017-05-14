console.log("options starting up");
// Saves options to chrome.storage.sync.
function save_options() {
  var autoOpenSite = document.getElementById('site').value;
//   var likesColor = document.getElementById('like').checked;
  chrome.storage.sync.set({
    site: autoOpenSite
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

var requestPerms = withDidGrantFunction =>{
chrome.permissions.request({
        permissions:['storage']
    },withDidGrantFunction);
};
var oldDidGrantFunction = granted => {

        console.log('granted?', granted);
        if (granted){
            btnSave.addEventListener('click', save_options);
        } else {
            btnSave.style.display = 'none';
            status.textContent = 'Storage permission is required to save options';
        }
};
var getStorage = ((defaultValue, f) => {
    if(f!= null && typeof f ==="function"){
      chrome.storage.sync.get({
        site: defaultValue || 'cotli'
      }, f);
    } else {
      console.error('No callback was supplied', f);
    }
});
var displayStorage = statusOpt =>{
  getStorage('null', data => {
        console.log('show clicked', data);
        var status = statusOpt || document.getElementById('status');
        status.textContent=JSON.stringify(data);
})};


// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
    var status = document.getElementById('status');
    var btnSave = document.getElementById('save');
    var btnShow = document.getElementById('show');
    btnSave.addEventListener('click', save_options);
    btnShow.addEventListener('click', () => 
      displayStorage(status) 
    );
  // Use default value color = 'red' and likesColor = true.
    getStorage('cotli', 
      function(items) {
        console.log("storage returned", items);
        document.getElementById('site').value = items.site;
    });
    displayStorage();
}
document.addEventListener('DOMContentLoaded', restore_options);