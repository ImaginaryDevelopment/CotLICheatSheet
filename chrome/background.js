console.log('initializing');
var holder;
// was following https://www.sitepoint.com/create-chrome-extension-10-minutes-flat/
// to make this

// publishing
// https://developer.chrome.com/webstore/publish
// analytics tutorial
// https://developer.chrome.com/extensions/tut_analytics
// installation stuffs
// https://developer.chrome.com/webstore/inline_installation?hl=en-US
var inject = (tabId, title, codeString) =>{
    var toExecute = 'var script = document.createElement("script"); script.textContent = "' + codeString.replace(/"/g, '\\"') + "\"; document.head.appendChild(script); console.log('finished injection of " + title.replace(/"/g, '\\"') + "');";
    console.log('injecting toExecute: ' + title, toExecute);
    chrome.tabs.executeScript(tabId, {code:toExecute});
};
var injectData = (tabId, name, x) =>{
    var toExecute = 'var script = document.createElement("script"); script.textContent = "var ' + name + '=' + JSON.stringify(x).replace(/"/g, '\\"') + ';"; document.head.appendChild(script);';
    console.log('injecting toExecute', toExecute);
    chrome.tabs.executeScript(tabId, {code:toExecute});
};
// only keeping this until we are sure the site accepts the new data format and variable names.
var injectRaw = (tabId, name, x) =>{
   var escapedData = JSON.stringify(x)
                .replace(/'/g,"\\'")
                .replace(/"/g,'\\"');
    console.log('injecting string', escapedData);
    var toExecute = 'var script = document.createElement("script"); script.textContent = "var ' + name + '=\'' + 
            //JSON.stringify(data,null,2)
                escapedData
                + '\';"; document.head.appendChild(script);';
};

var onDataFetched = data =>
{
        holder = undefined;

        // console.log('XMLHttpRequest load', arguments);
        try{
            data.linked_accounts = undefined;

            data.db_stats = undefined;
            data.event_details = undefined;
            data.promotions = undefined;
        } catch (ex){
            console.log('removing properties error',ex);
        }
        console.log(JSON.stringify(data,null,2));
        // make a copy for the background to hold?
        if(window.fullData === true)
            window.data = JSON.parse(JSON.stringify(data));
        else window.data = data;
        var tabId;
        chrome.tabs.create({'url':"https://imaginarydevelopment.github.io/CotLICheatSheet/"}, tab =>{
            tabId = tab.id;
            console.log('tab created', tab);
        });
        var tryInjectors = name => {
            try{
                var target = data.details[name];
                injectRaw(tabId, name+"Raw", target);
                injectData(tabId, name+"Raw", target);
                data.details[name] = undefined;
            } catch(ex){
                console.error('failed injection for ' + name,ex);
            }
        };
        tryInjectors('heroes');
        tryInjectors('loot');
        tryInjectors('talents');

        // trimming to see if we can get data to go at all, and hopefully trimming unimportant props
        data.details.objective_status = undefined;
        try{
            injectData(tabId, 'automatonRemainder', data);
        } catch (ex){
            console.error('failed injection for remainder', data);
        }
        inject(tabId, 'importMeCaller', "window.importMe();");
};
var sendRequest = () =>
{
    var oReq = new XMLHttpRequest();
    oReq.submittedData = holder.requestBody;
    oReq.addEventListener("load", function(x) {
        console.info('XMLHttpRequest load');
        console.info('XMLH',oReq, x);
        window.raw = oReq.response;
        var response = JSON.parse(oReq.response);
        onDataFetched(response);
    });
    oReq.open("POST", holder.url);
    if(holder.httpHeaders){
        console.log('attaching headers is not implemented', holder.httpHeaders);
    }
    var formData = new FormData();
    Object.keys(holder.requestBody.formData).map( x =>{
        // console.log('adding formData', x, holder.requestBody.formData[x]);
        if(x === "include_free_play_objectives"){
            formData.append(x, false);
        } else
        formData.append(x, holder.requestBody.formData[x]);
    });
    // formData.append("call",["getUserDetails"]);

    oReq.send(formData);
};
var urls = {urls:[
        "*://*.djartsgames.ca/~idle/post.php*"
        //"<all_urls>"
      ]};
chrome.webRequest.onBeforeRequest.addListener(details =>
    {
        if(!details.requestBody || !details.requestBody.formData || !details.requestBody.formData.call.includes("getUserDetails"))
        {
            // console.log('ignoring request, getUserDetails not detected');
            return;
        }
        if(holder != null){
            console.info('aborting duplicate request');
            return;
        }
        console.info('onBeforeRequest', details);
        holder = {requestId:details.requestId,url:details.url, requestBody:details.requestBody};
    },
    urls
    , ["requestBody"]
);
chrome.webRequest.onBeforeSendHeaders.addListener(details =>
    {
        if(!holder || details.requestId != holder.requestId)
            return;

        console.info('onBeforeSendHeaders headersOpt',details.HttpHeaders);
        holder.httpHeaders = details.HttpHeaders;
    }
    , urls
);
chrome.webRequest.onCompleted.addListener(details =>{

    if(!holder || details.requestId != holder.requestId)
    {
        return;
    }
    console.log('onCompleted!', details.url,details.requestBody,details);
    console.log('onCompleted bodies', holder.requestBody, details.requestBody);
    console.log('Object.keys', Object.keys(holder.requestBody));
    sendRequest();
    // Object.keys(holder.requestBody).map(x =>
    //     console.log('found a key on holder',x)
    // );
},
  {urls:[
      "*://*.djartsgames.ca/~idle/post.php*"
      //"<all_urls>"
      ]}
  //, ["requestBody"]
);

console.log('initialized');
