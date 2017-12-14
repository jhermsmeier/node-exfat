var BlockDevice = require( 'blockdevice' )
var Disk = require( 'disk' )
var ExFAT = require( '..' )
var assert = require( 'assert' )
var path = require( 'path' )

var log = console.log.bind( console )
var inspect = function( value ) {
  return require( 'util' ).inspect( value, {
    colors: true,
    depth: null,
  })
}

suite( 'ExFAT', function() {
  
  var device = null
  var disk = null
  var partition = null
  var volume = null
  
  suiteSetup( 'Create BlockDevice', function() {
    device = new BlockDevice({
      path: path.join( __dirname, 'data', 'exfat.img' ), // 'usb-thumb-exfat.bin'
      mode: 'r',
      blockSize: 512,
    })
  })
  
  suiteSetup( 'Open Disk', function( done ) {
    disk = new Disk( device )
    disk.open( function( error ) {
      if( error ) console.log( 'ERROR', error.message )
      // log( inspect( disk ) )
      // log( '' )
      done()
    })
  })
  
  test( 'Instance ExFAT Volume', function( done ) {
    
    log( inspect( disk ) )
    log( '' )
    
    var part = disk.gpt.partitions[0]
    
    partition = device.partition({
      firstLBA: part.firstLBA,
      lastLBA: part.lastLBA,
    })
    
    volume = new ExFAT.Volume( partition )
    
    volume.mount( function( error ) {
      log( inspect( volume ) )
      log( '' )
      done( error )
    })
    
  })
  
  suiteTeardown( 'Close Disk', function( done ) {
    disk.close( done )
  })
  
})
