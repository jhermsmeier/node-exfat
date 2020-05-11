var { context, test, before } = require( '@jhermsmeier/control' )
var assert = require( 'assert' )
var path = require( 'path' )
var fs = require( 'fs' )
var stream = require( 'stream' )
var zlib = require( 'zlib' )
var ExFAT = require( '..' )
var inspect = require( './inspect' )

context( 'ExFAT', function() {
  
  before( 'Decompress image', function( done ) {
    
    var source = path.join( __dirname, 'data', 'exfat.img.gz' )
    var destination = path.join( __dirname, 'data', 'exfat.img' )
    var streams = [
      fs.createReadStream( source ),
      zlib.createGunzip(),
      fs.createWriteStream( destination )
    ]
    
    stream.pipeline( ...streams, done )
    
  })
  
})
