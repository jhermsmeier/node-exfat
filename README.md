# ExFat
[![npm](https://img.shields.io/npm/v/exfat.svg?style=flat-square)](https://npmjs.com/package/exfat)
[![npm license](https://img.shields.io/npm/l/exfat.svg?style=flat-square)](https://npmjs.com/package/exfat)
[![npm downloads](https://img.shields.io/npm/dm/exfat.svg?style=flat-square)](https://npmjs.com/package/exfat)
[![build status](https://img.shields.io/travis/jhermsmeier/node-exfat.svg?style=flat-square)](https://travis-ci.org/jhermsmeier/node-exfat)

## Requirements

Node.js v10+, or equivalent runtime (Browsers work too) with `BigInt` support

## Install via [npm](https://npmjs.com)

```sh
$ npm install --save exfat
```

## Supported Operations / Features

<details>
  <summary>Volume operations</summary>

- [ ] File system creation (mkfs)
- [ ] Integrity verification & repair (aka CHKDSK)

</details>

<details>
  <summary>Node core `fs` APIs</summary>

- [ ] access( path[, mode], callback )
- [ ] appendFile( path, data[, options], callback )
- [ ] chmod( path, mode, callback )
- [ ] chown( path, uid, gid, callback )
- [ ] close( fd, callback )
- [ ] copyFile( src, dest[, flags], callback )
- [ ] createReadStream( path[, options] )
- [ ] createWriteStream( path[, options] )
- [ ] fchmod( fd, mode, callback )
- [ ] fchown( fd, uid, gid, callback )
- [ ] fdatasync( fd, callback )
- [ ] fstat( fd[, options], callback )
- [ ] fsync( fd, callback )
- [ ] ftruncate( fd[, len], callback )
- [ ] futimes( fd, atime, mtime, callback )
- [ ] lchmod( path, mode, callback )
- [ ] lchown( path, uid, gid, callback )
- [ ] link( existingPath, newPath, callback )
- [ ] lstat( path[, options], callback )
- [ ] mkdir( path[, options], callback )
- [ ] mkdtemp( prefix[, options], callback )
- [ ] open( path[, flags[, mode]], callback )
- [ ] read( fd, buffer, offset, length, position, callback )
- [ ] read( fd, [options,] callback )
- [ ] readdir( path[, options], callback )
- [ ] readFile( path[, options], callback )
- [ ] readlink( path[, options], callback )
- [ ] realpath( path[, options], callback )
- [ ] rename( oldPath, newPath, callback )
- [ ] rmdir( path[, options], callback )
- [ ] stat( path[, options], callback )
- [ ] symlink( target, path[, type], callback )
- [ ] truncate( path[, len], callback )
- [ ] unlink( path, callback )
- [ ] utimes( path, atime, mtime, callback )
- [ ] unwatchFile( filename[, listener] )
- [ ] watchFile( filename[, options], listener )
- [ ] write( fd, buffer[, offset[, length[, position]]], callback )
- [ ] write( fd, string[, position[, encoding]], callback )
- [ ] writeFile( file, data[, options], callback )
- [ ] writev( fd, buffers[, position], callback )

</details>

## Usage

```js
var ExFAT = require( 'exfat' )
```

To operate an ExFAT volume, a `device` with the below API is required.
Position `0` must be the start of the ExFAT partition.

```js
var device = {
  read( buffer, offset, length, position, callback ) {}
  write( buffer, offset, length, position, callback ) {}
}
```

Now a volume can be instantiated on the device:

```js
var volume = new ExFAT.Volume({
  // Whether the volume is treated as read-only (default: true)
  readOnly: true,
  // Device's logical block size (default: device.blockSize || 512 )
  blockSize: 512,
  // I/O device API (see above)
  device: device,
})
```

And now the volume can be mounted and subsequently used until unmounted:
**NOTE:** Error handling omitted for brevity.

```js
volume.mount(( error ) => {
  
  console.log( 'Volume cluster usage', volume.fat.getUsage() )
  // -> { total: 3932160, used: 266625, bad: 0, free: 3665535 }
  console.log( 'Volume root cluster chain', volume.fat.getClusterChain( volume.vbr.rootDirCluster ) )
  // -> [ { number: 7, next: 4294967295 } ]
  
  volume.readDirEntries( this.vbr.rootDirCluster, ( error, entries ) => {
    console.log( 'Volume root directory entries:', entries )
    // -> [
    //   Label { type: 131, length: 7, value: 'WD Blue' },
    //   Bitmap {
    //     type: 129,
    //     unknown1: <Buffer 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00>,
    //     cluster: 2,
    //     size: 476723n
    //   },
    //   UpCase {
    //     type: 130,
    //     reserved1: <Buffer 00 00 00>,
    //     checksum: 3860452109,
    //     reserved2: <Buffer 00 00 00 00 00 00 00 00 00 00 00 00>,
    //     cluster: 6,
    //     size: 5836n
    //   },
    //   File {
    //     type: 133,
    //     continuations: 2,
    //     checksum: 63169,
    //     attr: 50,
    //     unknown1: 0,
    //     crtime: 21126,
    //     crdate: 20245,
    //     mtime: 21126,
    //     mdate: 20245,
    //     atime: 21126,
    //     adate: 20245,
    //     crtimeCs: 169,
    //     mtimeCs: 169,
    //     unknown2: <Buffer f8 f8 f8 00 00 00 00 00 00 00>
    //   },
    //   ...
    // ]
  })
  
  volume.unmount(( error ) => {
    // ...
  })
  
})
```

## Examples

### Inspecting Real Storage Devices

**Windows:**

NOTE: You'll need to run this in an Administrator command prompt

```sh
node example/inspect.js \\.\PhysicalDrive1
```

**Mac OS:**

```sh
sudo node example/inspect.js /dev/rdisk2
```

**Linux:**

```sh
sudo node example/inspect.js /dev/sda
```
