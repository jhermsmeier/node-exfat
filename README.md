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
