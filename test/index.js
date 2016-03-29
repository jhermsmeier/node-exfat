var BlockDevice = require( 'blockdevice' )
var Disk = require( 'disk' )
var ExFAT = require( '..' )
var assert = require( 'assert' )

var log = console.log.bind( console )
var inspect = function( value ) {
  return require( 'util' ).inspect( value, {
    colors: true,
    // depth: null,
  })
}

suite( 'ExFAT', function() {
  
  var device = null
  var disk = null
  var partition = null
  var volume = null
  
  suiteSetup( 'Create BlockDevice', function() {
    device = new BlockDevice({
      // path: BlockDevice.getPath( 2 ),
      path: __dirname + '/data/usb-thumb-exfat.bin',
      mode: 'r',
      blockSize: 512,
    })
  })
  
  suiteSetup( 'Open Disk', function( done ) {
    disk = new Disk( device )
    disk.open( done )
  })
  
  test( 'Instance ExFAT Volume', function() {
    
    log( inspect( disk ) )
    log( '' )
    
    var part = disk.mbr.partitions[0]
    partition = device.partition({
      firstLBA: part.firstLBA,
      lastLBA: part.firstLBA + part.sectors
    })
    
    volume = new ExFAT.Volume( partition )
    
    volume.mount( function( error ) {
      if( error ) console.trace( error.stack )
      log( inspect( volume ) )
      log( '' )
    })
    
  })
  
  teardown( 'Close Disk', function( done ) {
    disk.close( done )
  })
  
})

