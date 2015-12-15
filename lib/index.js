'use strict';

/**
 * Parse & create strings with the format: "mysql://john:pass@localhost:3306/my_db"
 *
 * The protocol and hostname are required.
 * The user, password, port, and path are optional.
 *
 * Usage:
 *
 * ```
 * # parse a DSN
 * var dsn = dissin('mysql://localhost/db');
 * console.log('%s', dsn);
 * // mysql://localhost/db
 *
 * # build a DSN (Node repl)
 * var dsn = dissin();
 * dsn.proto = 'mongo';
 * dsn.host = 'localhost';
 * // 'mongo://localhost/'
 *
 * # add custom validators
 * > dsn.addValidation('port', function(x) { return (x == 1234); } );
 * undefined
 * > dsn.port = 80;
 * 80
 * > dsn.toString()
 * 'mongo://localhost/'
 *
 * > dsn.errors
 * [ 'failed validation for port' ]
 *
 * > dsn.port = 1234;
 * 1234
 * > dsn.toString()
 * 'mongo://localhost:1234/'
 *
 * ````
 *
 * TODO
 *   - require hostname
 *   - generate the getters and setters
 *   - smarter regex's for the parser
 *   - enumerable getters and setters
 */

var util = require('util');

var loglevel = 'none';

var helpers = {
  toString: function() {
    debug('running')
    if (this._dirty) {
      var userhostport = this._user || '';
      if (this._password) {
        userhostport += ':' + this._password;
      }
      if (userhostport !== '') {
        userhostport += '@';
      }
      userhostport = userhostport + this._host;
      if (this._port) {
        userhostport += ':' + this._port;
      }
      this._dsn = util.format('%s://%s/%s', this._proto, userhostport, this._path.replace(/^\//, ''));
      this._dirty = false;
    }
    return this._dsn;
  },
  _validations: [],
  addValidation: function(field, validationFn) {
    this._validations[field] = validationFn;
  },
  isValid: function(field, value) {
    return typeof this._validations[field] === 'function' ? this._validations[field](value) : true;
  },
  get proto() {
    return this._proto;
  },
  set proto(x) {
    if (this.isValid('proto', x)) {
      this._dirty = true;
      this._proto = x;
    } else {
      this.errors.push('failed validation for proto');
    }
  },
  get user() {
    return this._user;
  },
  set user(x) {
    if (this.isValid('user', x)) {
      this._dirty = true;
      this._user = x;
    } else {
      this.errors.push('failed validation for user');
    }
  },
  get password() {
    return this._password;
  },
  set password(x) {
    if (this.isValid('password', x)) {
      this._dirty = true;
      this._password = x;
    } else {
      this.errors.push('failed validation for password');
    }
  },
  get host() {
    return this._host;
  },
  set host(x) {
    if (this.isValid('host', x)) {
      this._dirty = true;
      this._host = x;
    } else {
      this.errors.push('failed validation for host');
    }
  },
  get port() {
    return this._port;
  },
  set port(x) {
    if (this.isValid('port', x)) {
      this._dirty = true;
      this._port = x;
    } else {
      this.errors.push('failed validation for port');
    }
  },
  get path() {
    return this._path;
  },
  set path(x) {
    if (this.isValid('path', x)) {
      this._dirty = true;
      this._path = x;
    } else {
      this.errors.push('failed validation for path');
    }
  },
};

var dissin = function(dsnString) {
  return parseDSN(dsnString);
}

var createDSN = function() {
  var fields = {
    errors: {writable: true, enumerable: true, value: []},
    _proto: {writable: true, value: ''},
    _user: {writable: true, value: ''},
    _password: {writable: true, value: ''},
    _host: {writable: true, value: ''},
    _port: {writable: true, value: ''},
    _path: {writable: true, value: ''},
    _dirty: {writable: true, value: true}
  };
  var dsn = Object.create(helpers, fields);
  return dsn;
}

/**
 * Parse a DSN string via string splitting.
 *
 * It tries its best to parse a DSN. If the string is missing a protocol before the
 * '://' mark then it will push that error into an array of errors.
 *
 * Since some databases work with default ports and passwords we try to keep
 * as many fields optional as we can.
 */
function parseDSN(dsnString) {

  var dsn = createDSN();

  if (!dsnString) return dsn;

  var errors = [];
  var userpass = '';
  var hostportpath = '';
  var tmpString = dsnString || '';

  //-- proto | tail
  var _tmp = tmpString.split('://');
  if (_tmp.length === 1) {
    errors.push('missing protocol://')
  }
  dsn.proto = _tmp[0];
  tmpString = _tmp[1] || '';

  //-- user:pass | host:port/path
  _tmp = tmpString.split('@');
  if (_tmp.length > 1) {
    userpass = _tmp[0];
    hostportpath = _tmp[1];
  } else {
    hostportpath = _tmp[0];
  }

  // host:port | path
  _tmp = hostportpath.split('/');
  tmpString = _tmp.shift();
  dsn.path = _tmp.join('/');

  // host | port
  _tmp = tmpString.split(':');
  dsn.host = _tmp[0];
  dsn.port = _tmp[1] || null;

  // user | pass
  if (userpass) {
    _tmp = userpass.split(':');
    dsn.user = _tmp[0];
    dsn.password = _tmp[1];
  }

  dsn.errors = errors;
  return dsn;
}

function debug(str) {
  if (loglevel == 'debug') {
    console.log('debug: ' + str);
  }
}

module.exports = dissin;
