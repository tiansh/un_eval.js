var mocha = require('mocha');
var assert = require('assert');
var un_eval = require('../un_eval');

var testcase = function (obj, test) {
  return function () {
    "use strict";
    var result = un_eval(obj);
    var back = eval(result);
    var result_another = un_eval(back);
    assert.strictEqual(result, result_another);
    test(back);
  };
};

describe('Null and Undefined', function () {
  it('null', testcase(null, function (output) {
    assert.strictEqual(output, null);
  }));
  it('undefined', testcase(void 0, function (output) {
    assert.strictEqual(output, void 0);
  }));
});

describe('Number', function () {
  var numberItem = function (name, value) {
    it(name, testcase(value, function (output) {
      assert.strictEqual(Object.is(output, value), true);
    }));
  };
  numberItem('number 0', 0);
  numberItem('number -0', -0);
  numberItem('number 1', 1);
  numberItem('number -1', -1);
  numberItem('number PI', Math.PI);
  numberItem('number 1e100', 1e100);
  numberItem('number 1e-100', 1e-100);
  numberItem('number 1.23e100', 1.23e100);
  numberItem('number 1.23e100', 1.23e-100);
  numberItem('number Infinity', 1 / 0);
  numberItem('number -Infinity', -1 / 0);
  numberItem('number NaN', 0 / 0);

  var numberObjectItem = function (name, value) {
    it(name, testcase(Object(value), function (output) {
      assert.strictEqual(output instanceof Number, true);
      assert.strictEqual(Object.is(Number(output), value), true);
    }));
  };
  numberObjectItem('Number 0', 0);
  numberObjectItem('Number -0', -0);
  numberObjectItem('Number 1', 1);
  numberObjectItem('Number -1', -1);
  numberObjectItem('Number PI', Math.PI);
  numberObjectItem('Number 1e100', 1e100);
  numberObjectItem('Number 1e-100', 1e-100);
  numberObjectItem('Number 1.23e100', 1.23e100);
  numberObjectItem('Number 1.23e100', 1.23e-100);
  numberObjectItem('Number Infinity', 1 / 0);
  numberObjectItem('Number -Infinity', -1 / 0);
  numberObjectItem('Number NaN', 0 / 0);
});

describe('String', function () {
  var stringItem = function (name, str) {
    it(name, testcase(str, function (output) {
      assert.strictEqual(output, str);
    }));
  };
  stringItem('string empty', '');
  stringItem('string null char.', '\0');
  stringItem('string ascii', String.fromCharCode.apply(String, [...Array(128)].map((_, i) => i)));
  stringItem('string with line separators', '\u000a\u000d\u2028\u2029');
  stringItem('string unicode', '\u4e16\u754c\u4f60\u597d');
  stringItem('string more unicode', '\u{1f602}');

  var stringObjectItem = function (name, str) {
    it(name, testcase(Object(str), function (output) {
      assert.strictEqual(output instanceof String, true);
      assert.strictEqual(String(output), str);
    }));
  };
  stringObjectItem('String empty', '');
  stringObjectItem('String null char.', '\0');
  stringObjectItem('String ascii', String.fromCharCode.apply(String, [...Array(128)].map((_, i) => i)));
  stringObjectItem('String unicode', '\u4e16\u754c\u4f60\u597d');
  stringObjectItem('String more unicode', '\u{1f602}');
});

describe('Boolean', function () {
  it('boolean true', testcase(true, function (output) {
    assert.strictEqual(output, true);
  }));
  it('boolean false', testcase(false, function (output) {
    assert.strictEqual(output, false);
  }));
  it('Boolean true', testcase(Object(true), function (output) {
    assert.strictEqual(output instanceof Boolean, true);
    assert.strictEqual(Boolean.prototype.valueOf.call(output), true);
  }));
  it('Boolean false', testcase(Object(false), function (output) {
    assert.strictEqual(output instanceof Boolean, true);
    assert.strictEqual(Boolean.prototype.valueOf.call(output), false);
  }));
});

describe('Date', function () {
  var dateObjectItem = function (name, date) {
    it(name, testcase(date, function (output) {
      assert.strictEqual(output instanceof Date, true);
      assert.strictEqual(Object.is(Number(output), Number(date)), true);
    }));
  };
  dateObjectItem('Now', new Date());
  dateObjectItem('1970-1-1', new Date(0));
  dateObjectItem('2038-1-19', new Date((-1 >>> 1) * 1000));
  dateObjectItem('2038-1-20', new Date(((-1 >>> 1) * 1000) + 86400));
  dateObjectItem('1901-12-13', new Date(~(-1 >>> 1) * 1000));
  dateObjectItem('1901-12-12', new Date((~(-1 >>> 1) * 1000) - 86400));
  dateObjectItem('new Date(42)', new Date(42));
  dateObjectItem('Invalid', new Date(NaN));
});

describe('RegExp', function () {
  var regexpObjectItem = function (name, regexp) {
    it(name, testcase(regexp, function (output) {
      assert.strictEqual(output instanceof RegExp, true);
      assert.strictEqual(output.source, regexp.source);
      assert.strictEqual(output.global, regexp.global);
      assert.strictEqual(output.multiline, regexp.multiline);
      assert.strictEqual(output.ignoreCase, regexp.ignoreCase);
      assert.strictEqual(output.sticky, regexp.sticky);
      assert.strictEqual(output.unicode, regexp.unicode);
    }));
  };
  regexpObjectItem('empty', /(?:)/);
  regexpObjectItem('simple', /./);
  try { regexpObjectItem('flag g', eval('/./g')); } catch (_e1) { }
  try { regexpObjectItem('flag i', eval('/./i')); } catch (_e2) { }
  try { regexpObjectItem('flag m', eval('/./m')); } catch (_e3) { }
  try { regexpObjectItem('flag u', eval('/./u')); } catch (_e4) { }
  try { regexpObjectItem('flag y', eval('/./y')); } catch (_e5) { }
  regexpObjectItem('group', /[a-z\[\]]/);
  regexpObjectItem('slash', /\//);
  regexpObjectItem('quote', /'"/);
  regexpObjectItem('more', /^a?b+c*(?!d)e$/);
});

describe('Function', function () {
  var functionItem = function (name, func, callback) {
    it(name, testcase(func, function (output) {
      assert.strictEqual(output instanceof Function, true);
      assert.strictEqual(output.name, func.name, true);
      assert.strictEqual(output.length, func.length, true);
      if (callback) callback(output);
    }));
  };
 
  functionItem('noop', function () { }, function (output) {
    assert.strictEqual(output(), void 0);
  });
  functionItem('identity', function (x) { return x; }, function (output) {
    assert.strictEqual(output(), void 0);
    assert.strictEqual(output(1), 1);
    assert.strictEqual(output(true), true);
    assert.strictEqual(output(''), '');
  });
  functionItem('plus', function (x, y) { return x + y; }, function (output) {
    assert.strictEqual(output(1, 2), 3);
    assert.strictEqual(output('1', 2), '12');
  });
});

describe('Array', function () {
  var arrayItem = function (name, array, callback) {
    it(name, testcase(array, function (output) {
      assert.strictEqual(output instanceof Array, true);
      assert.strictEqual(output.length, array.length);
      for (var i = 0, l = output.length; i < l; i++) {
        assert.strictEqual(i in output, i in array);
        assert.strictEqual(un_eval(output[i]), un_eval(array[i]));
        assert.strictEqual('' + (output[i]), '' + (array[i]));
      }
      if (callback) callback(output);
    }));
  };
  arrayItem('empty', []);
  arrayItem('single', [null]);
  arrayItem('pair', 'hello world'.split(' '));
  arrayItem('tuple', [3, 4, 5]);
  arrayItem('hole', Array(8));
  arrayItem('all types', [1, 'a', true, null, void 0, new Date(0), /(?:)/ig, function () { }]);
});

describe('Object', function () {
  var objectItem = function (name, obj, callback) {
    it(name, testcase(obj, function (output) {
      assert.strictEqual(output instanceof Object, true);
      assert.deepStrictEqual(Object.keys(output), Object.keys(obj));
      assert.deepStrictEqual(
        Object.keys(output).map(function (key) { return un_eval(output[key]); }),
        Object.keys(obj).map(function (key) { return un_eval(obj[key]); })
      );
      assert.deepStrictEqual(
        Object.keys(output).map(function (key) { return output[key] + ''; }),
        Object.keys(obj).map(function (key) { return obj[key] + ''; })
      );
      if (callback) callback(output);
    }));
  };
  var objectItem = function (name, obj, callback) {
    it(name, testcase(obj, function (output) {
      assert.strictEqual(output instanceof Object, true);
      assert.deepStrictEqual(Object.keys(output), Object.keys(obj));
      if (callback) callback(output);
    }));
  };
  objectItem('empty', {});
  objectItem('simple', { p: 42 });
  objectItem('multi', { p: 42, q: true, hello: 'world' });
  objectItem('special key', {'\u2028\u2029': 42, '\r\n': 88, '\u4e16\u754c\u4f60\u597d': 'hello', '\u{1f602}': 'world' });
  objectItem('same ref.', function () {
    var a = {};
    a.p = a.q = { x: true };
    a.x = a.y = { y: 42 };
    return a;
  }());
  objectItem('circular simple', function () {
    var a = {};
    a.x = a;
    return a;
  }(), function (output) {
    assert.deepStrictEqual(Object.keys(output.x), []);
  });
  objectItem('circular array', function () {
    var a = [];
    a[0] = a;
    return a;
  }(), function (output) {
    assert.deepStrictEqual(Object.keys(output), ['0']);
    assert.deepStrictEqual(output[0], []);
  });
  objectItem('circular complex', function () {
    var a = {};
    a.x = {};
    a.y = {};
    a.x.y = a.y;
    a.y.x = a.x;
    return a;
  }(), function (output) {
    assert.deepStrictEqual(Object.keys(output.x), ['y']);
    assert.deepStrictEqual(Object.keys(output.y), ['x']);
    assert.deepStrictEqual(Object.keys(output.x.y), ['x']);
    assert.deepStrictEqual(Object.keys(output.y.x), ['y']);
    assert.deepStrictEqual(Object.keys(output.x.y.x), []);
    assert.deepStrictEqual(Object.keys(output.y.x.y), []);
  });
});

describe('Error handle', function () {
  function TypeName() { };
  testcase('unknown type', new TypeName(), function (output) {
    assert.strictEqual(un_eval(output), '({})');
  });
  testcase('proxy', new Proxy(function () { }, {}), function (output) {
  });
})
