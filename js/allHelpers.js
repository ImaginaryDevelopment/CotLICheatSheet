var loggedStorageFailure = false;
const isDefined = function(o){
    return typeof(o) !== 'undefined' && o !== null;
};

var getNumberOrDefault = (x, defaultValue) =>
  Number.isNaN(+x) || !(x != null) ? defaultValue : +x;

/**
 *
 * @param {object} source
 * @param {object} toMerge
 */
const copyObject = (source,toMerge, defaultValue) => {
    var target = toMerge ? toMerge : {};
    if(!(source != null) && defaultValue != null)
      return defaultValue;
    Object.keys(source)
      .filter(prop => !(prop in target))
      .map(prop =>
        target[prop] = source[prop]
    );
    return target;
};

/**
 *
 * @param {string} s
 */
const trim = function(s) {
    return s.trim();
};

// starts at 0
// input 0 -> [], 1 -> [0]
const createRange = n => Array.apply(null, {length:n}).map(Number.call, Number);

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
// accept either param being an array, or neither, or any combination
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

/**
 *
 * @param {number} x
 */
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

/**
 *
 * @param {string} key
 * @param {*} value
 */
var storeIt = function(key,value){
  var canStore = getIsLocalStorageAvailable();
  if(canStore){
    var stringy = JSON.stringify(value);
    //console.info('storing:' + key,value);
    localStorage.setItem(key,stringy);
  }
};
/**
 *
 * @param {string} key
 * @param {*} defaultValue
 */
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

/**
 *
 * @param {string} category
 * @param {string} action
 * @param {string} labelOpt
 * @param {number} numberValueOpt
 */
var gaEvent = (category,action,labelOpt,numberValueOpt) =>
  ga ? ga('send','event',category, action, labelOpt, numberValueOpt) : null;

function padLeft(nr, n, str){
    return Array(n-String(nr).length+1).join(str||'0')+nr;
}
var add = function(a,b){
  return a + b;
};

/**
 *
 * @param {*} data
 * @param {string} title
 * @param {*} extraData
 */
var inspect = (data,title, extraData) =>
{
  if(extraData)
    console.log(title || 'inspect', data,extraData);
  else
    console.log(title|| 'inspect', data);
  return data;
};
var tryCaptureThrow =  (f, data, title, logSuccess) => {
  try{
    var result = f();
    if(logSuccess===true)
      console.info(title || 'tryCaptureThrowSuccess');
    return f();
  } catch(ex){
    if(title){
      console.warn(title, data);
    } else
    console.warn(data);
    throw ex;
  }
};
var tryCaptureLog = (f,data,title) => {
  try{
    return f();
  } catch (ex){
    if(title){
      console.error(title,data);
    } else console.error(data);
  }

}

// adapted from http://stackoverflow.com/a/14438954/57883
Array.prototype.distinct = Array.prototype.disinct || function(v, i, s) {return this.filter((v,i,a) => a.indexOf(v) === i);};
