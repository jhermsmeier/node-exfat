var fs = require( 'fs' )
var path = require( 'path' )
var MBR = require( 'mbr' )
var GPT = require( 'gpt' )
var ExFAT = require( '..' )
var inspect = require( '../test/inspect' )

var argv = process.argv.slice( 2 )
var filename = argv.shift() || path.join( __dirname, '..', 'test', 'data', 'exfat.img' )

if( !filename ) {
  console.error( 'Usage: node example/inspect.js <filename>' )
  process.exit( 1 )
}

var device = {
  fd: null,
  start: 0,
  end: Infinity,
  blockSize: 512,
  open( callback ) {
    fs.open( filename, 'r', ( error, fd ) => {
      device.fd = fd
      callback( error )
    })
  },
  close( callback ) {
    fs.close( device.fd, callback )
  },
  read( buffer, offset, length, position, callback ) {
    position = device.start + position
    fs.read( device.fd, buffer, offset, length, position, callback )
  },
  write( buffer, offset, length, position, callback ) {
    position = device.start + position
    fs.write( device.fd, buffer, offset, length, position, callback )
  },
  readMBR() {
    var buffer = Buffer.alloc( 512 )
    fs.readSync( device.fd, buffer, 0, buffer.length, 0 )
    var mbr = MBR.parse( buffer )
    return mbr
  },
  readGPT( mbr ) {
    
    mbr = mbr || device.readMBR()
    var efiPart = mbr.getEFIPart()
    if( !efiPart ) return null
    
    var position = efiPart.firstLBA * device.blockSize
    var length = 64 * 1024
    var offset = 0
    var gpt = new GPT()
    var buffer = Buffer.alloc( length )
    
    fs.readSync( device.fd, buffer, offset, length, position )
    gpt.parse( buffer )
    
    return gpt
    
  }
}

var volume = new ExFAT.Volume({
  readOnly: true,
  device: device,
})

console.log( inspect( volume ) )

device.open(( error ) => {
  
  if( error ) throw error;
  
  var mbr = device.readMBR()
  var gpt = device.readGPT()
  var exfatPart = null
  
  if( gpt ) {
    console.log( inspect( gpt ) )
    exfatPart = gpt.partitions.find(( partition ) => {
      return partition.type === 'EBD0A0A2-B9E5-4433-87C0-68B6B72699C7'
    })
  }
  
  if( !exfatPart && mbr ) {
    console.log( inspect( mbr ) )
    exfatPart = mbr.partitions.find(( partition ) => {
      return partition.type === 0x07
    })
  }
  
  if( exfatPart ) {
    device.start = exfatPart.firstLBA * device.blockSize
    device.end = exfatPart.lastLBA * device.blockSize
  }
  
  volume.mount( function( error ) {
    
    console.log( 'Volume.mount()', error || volume )
    console.log( 'Volume cluster usage', volume.fat.getUsage() )
    console.log( 'Volume root cluster chain', volume.fat.getClusterChain( volume.vbr.rootDirCluster ) )
    
    volume.readDirEntries( volume.vbr.rootDirCluster, ( error, entries ) => {
      console.log( 'Volume.readDirEntries()', error || entries )
      volume.readBitmap( this.vbr.rootDirCluster, ( error, table ) => {
        console.log( error || table )
        device.close(( error ) => {})
      })
    })
    
  })
  
})
