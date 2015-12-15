var test = require('tape');
var dissin = require('..')

test('dsn has validate helper', function (t) {
  t.plan(1);
  var dsn = dissin();
  t.equal(typeof dsn.addValidation, 'function');
})


test('parse a dsn', function (t) {
    t.plan(6);
    var dsnString = 'http://user:password@hostname:8080/app';
    var dsn = dissin(dsnString);
    t.equal(dsn.proto, 'http');
    t.equal(dsn.user, 'user');
    t.equal(dsn.password, 'password');
    t.equal(dsn.host, 'hostname');
    t.equal(dsn.port, '8080');
    t.equal(dsn.path, 'app')
});

test('toString a dsn', function (t) {
    t.plan(1);
    var dsn = dissin();
    dsn.proto = 'http';
    dsn.host = 'www.google.com';
    dsn.port = 123;
    t.equal(dsn.toString(), 'http://www.google.com:123/');
});

test('toString: password is optional', function(t) {
  t.plan(1);
  t.plan(1);
  var dsn = dissin();
  dsn.proto = 'http';
  dsn.host = 'www.google.com';
  dsn.port = 123;
  t.equal(dsn.toString(), 'http://www.google.com:123/');
});

test('toString: port is optional', function(t) {
  t.plan(1);
  var dsn = dissin();
  dsn.proto = 'http';
  dsn.host = 'www.google.com';
  dsn.path = '/products/shirts';
  t.equal(dsn.toString(), 'http://www.google.com/products/shirts');
});

test('validators: ignore invalid updates', function(t) {
  t.plan(3);
  var dsn = dissin()
  dsn.proto = 'mongo';
  dsn.host = 'localhost';
  dsn.port = '33'
  t.equal(dsn.toString(), 'mongo://localhost:33/');
  dsn.addValidation('port', function(x) { if (x == 1234) { return true } });
  dsn.port = 80;
  t.equal(dsn.toString(), 'mongo://localhost:33/');
  dsn.port = 1234;
  t.equal(dsn.toString(), 'mongo://localhost:1234/');
});

test('parse: quietly enter error when a validation fails', function (t) {
  t.plan(2);
  var dsn = dissin()
  dsn.proto = 'mongo';
  dsn.host = 'localhost';
  dsn.addValidation('port', function(x) { if (x == 1234) { return true } });
  dsn.port = 80;
  t.equal(dsn.toString(), 'mongo://localhost/');
  console.log(dsn.errors)
  t.equal(dsn.errors.length, 1);
  //t.equal(dsn._errors.length, 'mongo://localhost:1234/');
});

test('caching: dirty flag toggles on change', function(t) {
  t.plan(2);
  var dsn = dissin('mysql://mydb.com:99/app');
  t.equal(dsn._dirty, true, 'dsn dirty flag should be true after write');
  dsn.toString();
  t.equal(dsn._dirty, false, 'dsn dirty flag should be false after toString()');
});
