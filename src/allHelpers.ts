/* global ga global module window */
"use strict";
// for reference:
// http://stackoverflow.com/questions/37807779/what-is-the-difference-of-the-different-ways-of-importing-libraries-in-typescrip/37808633#37808633
// https://github.com/Microsoft/TypeScript/issues/2812
// https://github.com/Microsoft/TypeScript/issues/2709
// https://www.typescriptlang.org/docs/handbook/module-resolution.html
// http://stackoverflow.com/questions/12930049/how-do-i-import-other-typescript-files
/* testing */
declare var global:any;
declare var module:any;
declare var ga:any;
// declare var window:any;

// String['funcName'] = ...
interface StringConstructor {
    // this exists in my browser, maybe not all though
    trim(s:string):string;
    contains(s:string,delimiter:string): boolean;
}

interface String {
    contains(delimiter:string): boolean;
    before(delimiter:string): string;
    after(delimiter:string): string;
}
interface Array<T>{
    includes(item:T): boolean;
}

var findJsParent = () =>
    ((typeof module !== "undefined" && module && module.exports
        || typeof module !== "undefined" && module)
        || typeof global !== "undefined" && global
        || typeof window !== "undefined" && window
);
(function(exports,exposeYourself:boolean){
  exports.findJsParent = exports.findJsParent || findJsParent;

  var loggedStorageFailure = false;
  exports.isDefined = function(o){
      return o != null;
  };

   String['trim'] = function(s:string){
        if(s != null)
            return s.trim();
        return s;
    }

    // adding static and instance methods
    String['contains'] = (s:string,delimiter:string) =>
        s != null && delimiter != null && delimiter != "" && s.indexOf(delimiter) >= 0;

    String.prototype.contains = function(delimiter){
        return String.contains(this,delimiter);
    };
        exports.before = (s,delimiter) => {
        if(!delimiter) throw Error('no delimiter provided in "' + s + "'.before(delimiter)");
        var i = s.indexOf(delimiter);
        if(i < 0) throw Error("delimiter('" + delimiter + "') not found in '" + s + "'");
        return s.substr(0,i);
    };
    String.prototype.before = function(delimiter){
        return exports.before(this,delimiter);
    };
    exports.after = (s,delimiter) =>{
        if(!delimiter) throw Error('no delimiter provided in "' + s + "'.after(delimiter)");
        var i = s.indexOf(delimiter);
        if(i < 0) throw Error("delimiter('" + delimiter + "') not found in '" + s + "'");
        return s.substr(s.indexOf(delimiter) + delimiter.length);
    }
    String.prototype.after = function(delimiter) {
        return exports.after(this,delimiter);
    };
  exports.getNumberOrDefault = (x, defaultValue) =>
    Number.isNaN(+x) || !(x != null) ? defaultValue : +x;

  /**
   *
   * @param {object} source
   * @param {object} toMerge
   */
  // behavior is undefined for arrays.. what should it do?
  exports.copyObject = (source,toMerge, defaultValue) => {
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
  exports.trim = function(s) {
      return s.trim();
  };

  // starts at 0
  // input 0 -> [], 1 -> [0]
  exports.createRange = n => Array.apply(null, {length:n}).map(Number.call, Number);

  var debounce = (function(){
          var timer = 0;
          return (function(callback, ms){
              if(typeof(callback) !== "function")
                  throw callback;
              // this method does not ever throw, or complain if passed an invalid id
              clearTimeout(timer);
              timer = setTimeout(callback,ms); //setTimeout(callback,ms);
          });
  })();
  if(exposeYourself)
    exports.debounce = debounce;

  exports.debounceChange = function (callback, e, ...args) {
      if(!exports.isDefined(callback)){
          console.info('no callback for debounceChange',e.target, typeof(callback),callback);
          return;
      }
      e.persist();
      args.unshift(e.target.value);
      debounce(() => callback(...args), 500);
  };

  exports.flattenArray = <T> (a:T|T[],recurse) => {
        if(!(a != null)) return [];
        if(Array.isArray(a)){
            var b = a as T[];
            var result :any[] = [].concat.apply([],b);
            if(!recurse)
                return result;
            var index;
            while (( index = result.findIndex(Array.isArray)) > -1)
                result.splice(index,1, ...result[index]);
            return result;
        }
        return [a];
  };

  /** @return {Array} */
  exports.toClassArray = (x:string|string[]) => {
      if (!(x != null))
          return [];
      if(typeof x ==="string"){
          x = x.trim();
          if(x === "")
              return [];
          if (x.contains(" ")){
              return x.split(" ").map(x => x.trim())
          }
          return [x];
      }
      if(Array.isArray(x)){
          x=[].concat.apply([], x.filter(x => x != null).map(exports.toClassArray))
          return x;
      }
  }

  // otherClasses: allows/adapts to inputs of type string or array
  exports.addClasses = (defaultClasses:string[] = [], otherClasses:string|string[] = []) => {
      var result = exports.toClassArray(defaultClasses).concat(exports.toClassArray(otherClasses));
      return result.filter(exports.isDefined).map(String.trim).join(' ').trim();
  }

  /**
   *
   * @param {number} x
   */
  exports.numberWithCommas = (x:number) => {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  exports.getIsLocalStorageAvailable = () => {
    if (typeof(localStorage) !== 'undefined' && (typeof(localStorage.setItem) === 'function') && typeof(localStorage.getItem) === 'function'){
      return true;
    }
    try {
      var storage = exports['localStorage'],
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
  exports.storeIt = function(key,value){
    var canStore = exports.getIsLocalStorageAvailable();
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
  exports.readIt = function(key,defaultValue){
    if(exports.getIsLocalStorageAvailable()){
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
  exports.gaEvent = (category,action,labelOpt,numberValueOpt) =>
    typeof ga != "undefined" && ga ? ga('send','event',category, action, labelOpt, numberValueOpt) : null;

  exports.padLeft = (nr, n, str) => {
      return Array(n-String(nr).length+1).join(str||'0')+nr;
  };
  exports.add = function(a,b){
    return a + b;
  };

  /**
   *
   * @param {number|Date} x
   */
  exports.getDayOfWeek = (x:number|Date) =>{
    if(!(x != null))
      return undefined;

    var day = x;
    if(typeof x == "object"){
      if(x instanceof Date){
          day = x.getDay();
      } else {
        console.warn("unexpected date object", x); // eslint-disable-line no-console
        return undefined;
      }
    }

        switch(day){
          case 0: return "Sunday";
          case 1: return "Monday";
          case 2: return "Tuesday";
          case 3: return "Wednesday";
          case 4: return "Thursday";
          case 5: return "Friday";
          case 6: return "Saturday";
          default:
          console.error("unexpected day : " + day); // eslint-disable-line no-console
        }
      return undefined;
    };


  /**
   *
   * @param {*} data
   * @param {string} title
   * @param {*} extraData
   */
  exports.inspect = (data,title?: string, extraData?) =>
  {
    if(extraData)
      console.log(title || 'inspect', data,extraData); // eslint-disable-line no-console
    else
      console.log(title || 'inspect', data); // eslint-disable-line no-console
    return data;
  };

      // From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
    // polyfill for older browsers, which this project really doesn't need
  if (!Object.keys) {
      Object.keys = (function () {
          'use strict';
          var hasOwnProperty = Object.prototype.hasOwnProperty,
              hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
              dontEnums = [
              'toString',
              'toLocaleString',
              'valueOf',
              'hasOwnProperty',
              'isPrototypeOf',
              'propertyIsEnumerable',
              'constructor'
              ],
              dontEnumsLength = dontEnums.length;

          return function (obj) {
              if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
                  throw new TypeError('Object.keys called on non-object');
              }

              var result:any[] = [], prop, i;

              for (prop in obj) {
                  if (hasOwnProperty.call(obj, prop)) {
                      result.push(prop);
                  }
              }

              if (hasDontEnumBug) {
                  for (i = 0; i < dontEnumsLength; i++) {
                      if (hasOwnProperty.call(obj, dontEnums[i])) {
                          result.push(dontEnums[i]);
                      }
                  }
              }
              return result;
          };
      }());
  }
  /**
   *
   * @param {() => any} f
   * @param {*} data
   * @param {string} title
   * @param {boolean} logSuccess
   */
  exports.tryCaptureThrow =  (f: () => any, data, title?:string, logSuccess?:boolean) => {
    try{
      var result = f();
      if(logSuccess===true)
        console.info(title || 'tryCaptureThrowSuccess'); // eslint-disable-line no-console
      return result;
    } catch(ex){
      if(title){
        console.warn(title, data); // eslint-disable-line no-console
      } else
      console.warn(data); // eslint-disable-line no-console
      throw ex;
    }
  };

  /**
   * @param {string} title
   */
  exports.tryCaptureLog = (f,data,title?:string) => {
    try{
      return f();
    } catch (ex){
      if(title){
        console.error(title,data); // eslint-disable-line no-console
      } else console.error(data); // eslint-disable-line no-console
    }

  }

  // adapted from http://stackoverflow.com/a/14438954/57883
  Array.prototype['distinct'] = Array.prototype['distinct'] || function(v, i, s) {return (s || this).filter((v,i,a) => a.indexOf(v) === i);};
})(findJsParent(), false);