console.log('initializing');
var holder;
// was following https://www.sitepoint.com/create-chrome-extension-10-minutes-flat/
// to make this
var sendRequest = () =>
{
    var oReq = new XMLHttpRequest();
    oReq.submittedData = holder.requestBody;
    oReq.addEventListener("load", function(a,b,c,d,e) {
        console.log('XMLHttpRequest load');
        console.log('XMLH',a,b,c,d,e);
        // console.log('XMLHttpRequest load', arguments);
    });
    oReq.open("POST", holder.url);
    if(holder.httpHeaders){
        console.log('attaching headers is not implemented', holder.httpHeaders);
    }
    var formData = new FormData();
    Object.keys(holder.requestBody.formData).map( x =>{
        // console.log('adding formData', x, holder.requestBody.formData[x]);
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
        console.log('onBeforeRequest', details);
        if(holder != null){
            console.log('aborting duplicate request');
            return;
        }
        holder = {requestId:details.requestId,url:details.url, requestBody:details.requestBody};
    },
    urls
    , ["requestBody"]
);
chrome.webRequest.onBeforeSendHeaders.addListener(details =>
    {
        if(!holder || details.requestId != holder.requestId)
            return;

        console.log('onBeforeSendHeaders headersOpt',details.HttpHeaders);
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
