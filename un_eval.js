; (function () {

  var root = typeof self == 'object' && self.self === self && self ||
    typeof global == 'object' && global.global === global && global ||
    this;
  
  var un_eval = (function () {
    var helper = function (obj, seen) {
      try {
        if (obj === null) return 'null'; // null
        if (obj === void 0) return '(void 0)'; // undefined
        if (obj == null) return '({})'; // maybe undetectable
        if (typeof obj === 'number') {
          if (1 / obj === -Infinity) return '-0';
          // toString should work all values but not -0
          return Number.prototype.toString.call(obj);
        }
        // string or boolean
        if (!(obj instanceof Object)) return JSON.stringify(obj);
        // String, Number, Boolean
        if (obj instanceof String) return '(new String(' + helper(String.prototype.valueOf.call(obj)) + '))';
        if (obj instanceof Number) return '(new Number(' + helper(Number.prototype.valueOf.call(obj)) + '))';
        if (obj instanceof Boolean) return '(new Boolean(' + helper(Boolean.prototype.valueOf.call(obj)) + '))';
        // RegExp; toString should work
        if (obj instanceof RegExp) return RegExp.prototype.toString.call(obj);
        // Date; convert obj to Number should work
        if (obj instanceof Date) return '(new Date(' + helper(Number(obj)) + '))';
        // Function
        if (obj instanceof Function) {
          var func = Function.prototype.toString.call(obj);
          if (/\{\s*\[native code\]\s*\}\s*$/.test(func)) return null;
          return '(' + func + ')';
        }
        if (seen.indexOf(obj) !== -1) return '({})';
        var newSeen = seen.concat([obj]);
        // Array
        if (obj instanceof Array) {
          var array = obj.map(function (o) { return helper(o, newSeen); });
          // Add a comma at end if last element is a hole
          var lastHole = array.length && !((array.length - 1) in array);
          return '[' + array.join(', ') + (lastHole ? ',' : '') + ']';
        }
        // Object
        if (obj instanceof Object) {
          var pairs = [];
          for (var key in obj) {
            pairs.push(JSON.stringify(key) + ':' + helper(obj[key], newSeen));
          }
          return '({' + pairs.join(', ') + '})';
        }
        return '({})';
      } catch (_ignore1) { }
      // there should be something wrong; maybe obj is a Proxy
      try {
        if (obj instanceof Object) return '({})';
        else return 'null';
      } catch (_ignore2) { }
      // there really should be something wrong which cannot be handled
      return 'null';
    };
    return function un_eval(obj) {
      return helper(obj, []);
    };
  }());

  un_eval.VERSION = '1.0.0';
  
  if (typeof exports != 'undefined' && !exports.nodeType) {
    if (typeof module != 'undefined' && !module.nodeType && module.exports) {
      exports = module.exports = un_eval;
    }
    exports.un_eval = un_eval;
  } else {
    root.un_eval = un_eval;
  }
  if (typeof define == 'function' && define.amd) {
    define('un_eval', [], function() {
      return un_eval;
    });
  }

}());
