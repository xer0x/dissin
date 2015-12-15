r u dissin me?
===

An over engineered module for parsing and assembling a DSN.

This was a fun chance to play around with Javascript's Object.create(). I've tried to keep the interface fairly sane. Run the constructor without `new` to create a DSN object.

## Usage:

#### Parse and edit a DSN
```
var dsn = dissin("proto://user:pass@host:port/path");

dsn.proto = 'http';

console.log(dsn.toString())
// http://user:pass@host:port/path
```

#### build a DSN
````
var dsn = dissin();
dsn.proto = 'mongo';
dsn.host = 'localhost';
console.log(%s, dsn);
// mongo://localhost/
```

#### add custom validators
```
var dsn = dissin('mysql://localhost');
dsn.addValidation('port', function(x) { return (x == 1234); } );
dsn.port = 80;
console.log('%s', dsn);
// mysql://localhost/

console.log(dsn.errors)
// [ 'failed validation for port' ]

dsn.port = 1234;
console.log('%s', dsn);
// mysql://localhost:1234/
```

