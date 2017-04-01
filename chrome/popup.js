
console.log('popup.js starting');
document.addEventListener("DOMContentLoaded", function (event){

    var bg = chrome.extension.getBackgroundPage();
    console.log(bg.heroesRaw);
    var clearButton = document.getElementById('clear');
    var status = document.getElementById('status');
    var updateStatusText = function(t){
        if(status.textContent != null)
            status.textContent = t;
        else
            status.innerText = t;
    };
    var refreshStatus = () =>{
        console.log('refreshing status');
        if(!(bg != null))
        {
            console.log('updating text no bg');
            updateStatusText('script error, background page not found');
            return;
        }
        console.log('updating text, with bg');
        updateStatusText(bg.raw ? 'data found,ready to copy' : 'no data loaded, restart the game or refresh the game page');
    };
    new Clipboard('.btn', {text: function(trigger){
        console.log('getting text from bg for clipboard', bg && bg.raw && bg.raw.length);
        return JSON.stringify(trigger.id == "copy" ? bg.cleaned : bg.raw);
    }});
    clearButton.onClick = function(event){
        bg.raw = null;
        bg.cleaned = null;
        refreshStatus();
    };
    refreshStatus();
});
