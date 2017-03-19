var loggedStorageFailure = false;
const isDefined = function(o){
    return typeof(o) !== 'undefined' && o !== null;
};

var getNumberOrDefault = (x, defaultValue) =>
  Number.isNaN(x) || !(x != null) ? defaultValue : +x;

const copyObject = (source,toMerge) => {
    var target = toMerge ? toMerge : {};
    Object.keys(source)
      .filter(prop => !(prop in target))
      .map(prop =>
        target[prop] = source[prop]
    );
    return target;
};

const trim = function(s) {
    return s.trim();
};

const debounce = (function(){
        var timer = 0;
        return (function(callback, ms){
            if(typeof(callback) !== "function")
                throw callback;
            // this method does not ever throw, or complain if passed an invalid id
            clearTimeout(timer);
            timer = setTimeout(callback,ms); //setTimeout(callback,ms);
        });
    })();

var debounceChange = function (callback, e, ...args) {
    if(!isDefined(callback)){
        console.info('no callback for debounceChange',e.target, typeof(callback),callback);
        return;
    }
    e.persist();
    args.unshift(e.target.value);
    debounce(() => callback(...args), 500);
};
// reworked without let, since the browser support for it is low
const flattenArrays = (a,b) => {
        var isAa = Array.isArray(a),isAb = Array.isArray(b);
        if(isAa && !isAb){
            var result1 = a.slice(0);
            result1.push(b);
            return result1;
        }
        if(isAa && isAb){
            return a.concat(b);
        }
        if(!isAa && isAb){
            var result2 = [a].concat(b);
            return result2;
        }
        return [a,b];
    };
// otherClasses: allows/adapts to inputs of type string or array
const addClasses = (defaultClasses=[], otherClasses=[]) =>{
    var unwrappedClasses = defaultClasses.reduce(flattenArrays,[]);
    var otherClassesX = Array.isArray(otherClasses) ? otherClasses : otherClasses.split(" ");
    unwrappedClasses = otherClassesX.reduce(flattenArrays,[]).concat(unwrappedClasses);
    return unwrappedClasses.filter(isDefined).map(trim).join(' ').trim();
};

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function getIsLocalStorageAvailable() {
  if (typeof(localStorage) !== 'undefined' && (typeof(localStorage.setItem) === 'function') && typeof(localStorage.getItem) === 'function'){
    return true;
  }
	try {
		var storage = window[type],
			x = '__storage_test__';
		storage.setItem(x, x);
		storage.removeItem(x);
    console.info('storage is available!');
		return true;
	}
	catch(e) {
    if(!loggedStorageFailure){
      loggedStorageFailure = true;
      console.info('failed to test storage available');
    }
		return false;
	}
}
var storeIt = function(key,value){
  var canStore = getIsLocalStorageAvailable();
  if(canStore){
    var stringy = JSON.stringify(value);
    //console.info('storing:' + key,value);
    localStorage.setItem(key,stringy);
  }
};
var readIt = function(key,defaultValue){
  if(getIsLocalStorageAvailable()){
    var item = localStorage.getItem(key);
    if(typeof(item) !== 'undefined' && item != null){
      // console.info("read item from localStorage", key,item);
      try{
        return JSON.parse(item);
      }
      catch (ex)
      {
        return defaultValue;
      }
    } else {
      return defaultValue;
    }
  } else {
    return defaultValue;
  }
};

function padLeft(nr, n, str){
    return Array(n-String(nr).length+1).join(str||'0')+nr;
}
var add = function(a,b){
  return a + b;
};

var inspect = (data,title, extraData) =>
{
  console.log(title || 'inspect', data,extraData);
  return data;
};