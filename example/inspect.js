var ExFAT = require( '..' )
var BlockDevice = require( 'blockdevice' )
var Disk = require( 'disk' )
var inspect = require( '../test/inspect' )
var argv = process.argv.slice(2)

var devicePath = argv.shift()
var device = new BlockDevice({
  path: devicePath,
  mode: 'r',
  blockSize: 512,
})

var disk = new Disk( device )

function quit() {
  disk.close( function( error ) {
    if( error ) {
      return console.error( error )
    }
  })
}

disk.open( function( error ) {
  
  if( error ) {
    console.error( error )
    return quit()
  }
  
  inspect.log(disk)
  
  var partition = null
  var partitionIndex = -1
  
  if( disk.gpt ) {
    partition = disk.gpt.partitions.find(( partition ) => {
      return partition.type.toString() === 'EBD0A0A2-B9E5-4433-87C0-68B6B72699C7'
    })
    partitionIndex = disk.gpt.partitions.indexOf( partition )
    console.log( '' )
    console.log( 'Found GPT ExFAT in partition', partitionIndex + 1, '\n' )
    inspect.log( partition )
  } else if( disk.mbr ) {
    partition = disk.gpt.partitions.find(( partition ) => {
      return partition.type === 0x07
    })
    partitionIndex = disk.gpt.partitions.indexOf( partition )
    console.log( '' )
    console.log( 'Found MBR ExFAT in partition', partitionIndex + 1, '\n' )
    inspect.log( partition )
  }
  
  if( partition == null ) {
    console.log( 'No ExFAT partition found' )
    return quit()
  }
  
  var volume = new ExFAT.Volume( disk.partitions[ partitionIndex ] )
  
  volume.mount( function( error ) {
    
    if( error ) {
      console.error( error )
      return quit()
    }
    
    console.log( '' )
    console.log( 'Sector size', volume.sectorSize )
    console.log( 'Sectors per cluster', volume.sectorsPerCluster )
    console.log( 'Cluster size', volume.clusterSize )
    console.log( '' )
    
    inspect.log( volume )
    
    quit()
    
  })
  
})
