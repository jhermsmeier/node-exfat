# ExFat
[![npm](https://img.shields.io/npm/v/exfat.svg?style=flat-square)](https://npmjs.com/package/exfat)
[![npm license](https://img.shields.io/npm/l/exfat.svg?style=flat-square)](https://npmjs.com/package/exfat)
[![npm downloads](https://img.shields.io/npm/dm/exfat.svg?style=flat-square)](https://npmjs.com/package/exfat)
[![build status](https://img.shields.io/travis/jhermsmeier/node-exfat.svg?style=flat-square)](https://travis-ci.org/jhermsmeier/node-exfat)

## Install via [npm](https://npmjs.com)

```sh
$ npm install --save exfat
```

## Example

```sh
node example/inspect.js test/data/exfat.img
```

<details>
  <summary>Output</summary>

```js
Disk {
  device:
   BlockDevice {
     fd: 13,
     path: 'test/data/exfat.img',
     mode: 'r',
     blockSize: 512,
     size: -1,
     headsPerTrack: -1,
     sectorsPerTrack: -1 },
  mbr:
   MODERN {
     physicalDrive: 0,
     timestamp: { seconds: 0, minutes: 0, hours: 0 },
     signature: 0,
     copyProtected: false,
     partitions:
      [ Partition {
          status: 0,
          type: 238,
          sectors: 62539,
          firstLBA: 1,
          firstCHS: CHS { cylinder: 1023, head: 255, sector: 62 },
          lastCHS: CHS { cylinder: 1023, head: 255, sector: 62 } },
        Partition {
          status: 0,
          type: 0,
          sectors: 0,
          firstLBA: 0,
          firstCHS: CHS { cylinder: 0, head: 0, sector: 0 },
          lastCHS: CHS { cylinder: 0, head: 0, sector: 0 } },
        Partition {
          status: 0,
          type: 0,
          sectors: 0,
          firstLBA: 0,
          firstCHS: CHS { cylinder: 0, head: 0, sector: 0 },
          lastCHS: CHS { cylinder: 0, head: 0, sector: 0 } },
        Partition {
          status: 0,
          type: 0,
          sectors: 0,
          firstLBA: 0,
          firstCHS: CHS { cylinder: 0, head: 0, sector: 0 },
          lastCHS: CHS { cylinder: 0, head: 0, sector: 0 } } ],
     code:
      [ Code {
          offset: 0,
          data: <Buffer 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 ... > },
        Code {
          offset: 224,
          data: <Buffer 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 ... > } ] },
  gpt:
   GPT {
     blockSize: 512,
     guid: {4D2305A6-B202-452A-AB8D-CB349AFB8CF5},
     revision: 65536,
     headerSize: 92,
     headerCRC: 36895193,
     currentLBA: 1,
     backupLBA: 62539,
     firstLBA: 34,
     lastLBA: 62506,
     tableOffset: 2,
     entries: 128,
     entrySize: 128,
     tableCRC: 3255552676,
     partitions:
      [ Partition {
          type: {EBD0A0A2-B9E5-4433-87C0-68B6B72699C7},
          guid: {C8872ED0-D908-4D41-B116-F31B90610993},
          name: 'disk image',
          attr: <Buffer 00 00 00 00 00 00 00 00>,
          firstLBA: 2048,
          lastLBA: 61439 } ] },
  partitions:
   [ Partition {
       device:
        BlockDevice {
          fd: 13,
          path: 'test/data/exfat.img',
          mode: 'r',
          blockSize: 512,
          size: -1,
          headsPerTrack: -1,
          sectorsPerTrack: -1 },
       firstLBA: 2048,
       lastLBA: 61439 } ] }

Found GPT ExFAT in partition 1

Partition {
  type: {EBD0A0A2-B9E5-4433-87C0-68B6B72699C7},
  guid: {C8872ED0-D908-4D41-B116-F31B90610993},
  name: 'disk image',
  attr: <Buffer 00 00 00 00 00 00 00 00>,
  firstLBA: 2048,
  lastLBA: 61439 }

Sector size 512
Sectors per cluster 8
Cluster size 4096

Volume {
  partition:
   Partition {
     device:
      BlockDevice {
        fd: 13,
        path: 'test/data/exfat.img',
        mode: 'r',
        blockSize: 512,
        size: -1,
        headsPerTrack: -1,
        sectorsPerTrack: -1 },
     firstLBA: 2048,
     lastLBA: 61439 },
  vbr:
   BootRecord {
     jump: <Buffer eb 76 90>,
     oemName: 'EXFAT   ',
     reserved1: 0,
     sectorStart: 2048,
     sectorCount: 59392,
     fatSectorStart: 128,
     fatSectorCount: 128,
     clusterSectorStart: 256,
     clusterCount: 7392,
     rootDirCluster: 5,
     serialNumber: 1513248109,
     version: { major: 1, minor: 0 },
     volumeState: 0,
     sectorBits: 9,
     spcBits: 3,
     fatCount: 1,
     driveNumber: 128,
     allocatedPercent: 0,
     reserved2: <Buffer 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 ... >,
     bootSignature: 43605 },
  allocTable:
   AllocationTable {
     bits: 32,
     tables: [ <Buffer f8 ff ff ff ff ff ff ff ff ff ff ff 04 00 00 00 ff ff ff ff ff ff ff ff 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 ... > ] },
  root:
   Node {
     parent: undefined,
     child: undefined,
     next: undefined,
     prev: undefined,
     references: 0,
     fptrIndex: 0,
     fptrCluser: 0,
     entryCluster: 0,
     entryOffset: 0,
     flags: 0,
     size: 0,
     mtime: 0,
     atime: 0,
     name: '\u0000',
     startCluster: 5,
     fptrCluster: 5,
     entries:
      [ Label { type: 131, length: 8, name: 'Untitled' },
        Bitmap {
          type: 129,
          unknown1: <Buffer 00 81 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00>,
          startCluster: 2,
          size: 924 },
        UpCase {
          type: 130,
          reserved1: <Buffer 00 82 00>,
          checksum: 3860452109,
          reserved2: <Buffer 00 00 00 00 00 00 00 00 82 00 00 00>,
          startCluster: 3,
          size: 5836 },
        File {
          type: 5,
          continuations: 2,
          checksum: 60269,
          attr: 50,
          unknown1: 0,
          crtime: 19768,
          crdate: 19342,
          mtime: 19768,
          mdate: 19342,
          atime: 19768,
          adate: 19342,
          crtimeCs: 150,
          mtimeCs: 150,
          unknown2: <Buffer 00 00 00 00 00 00 00 00 00 00>,
          times:
           { created: 2017-12-14T09:41:49.500Z,
             modified: 2017-12-14T09:41:49.500Z,
             accessed: 2017-12-14T09:41:48.000Z },
          deleted: true },
        FileInfo {
          type: 64,
          flags: 3,
          reserved1: 0,
          nameLength: 10,
          nameHash: 35942,
          reserved2: 0,
          validSize: 4096,
          reserved3: <Buffer 00 00 00 00>,
          startCluster: 6,
          size: 4096,
          deleted: true },
        FileName { type: 65, unknown1: 0, name: '.fseventsd', deleted: true },
        File {
          type: 133,
          continuations: 2,
          checksum: 42205,
          attr: 48,
          unknown1: 0,
          crtime: 19780,
          crdate: 19342,
          mtime: 19780,
          mdate: 19342,
          atime: 19780,
          adate: 19342,
          crtimeCs: 27,
          mtimeCs: 55,
          unknown2: <Buffer 00 00 00 00 00 00 00 00 00 00>,
          times:
           { created: 2017-12-14T09:42:08.270Z,
             modified: 2017-12-14T09:42:08.550Z,
             accessed: 2017-12-14T09:42:08.000Z } },
        FileInfo {
          type: 192,
          flags: 3,
          reserved1: 0,
          nameLength: 15,
          nameHash: 62099,
          reserved2: 0,
          validSize: 4096,
          reserved3: <Buffer 00 00 00 00>,
          startCluster: 8,
          size: 4096 },
        FileName { type: 193, unknown1: 0, name: 'untitled folder' },
        File {
          type: 133,
          continuations: 2,
          checksum: 21863,
          attr: 32,
          unknown1: 0,
          crtime: 43041,
          crdate: 19013,
          mtime: 43041,
          mdate: 19013,
          atime: 19814,
          adate: 19342,
          crtimeCs: 100,
          mtimeCs: 100,
          unknown2: <Buffer 00 00 00 00 00 00 00 00 00 00>,
          times:
           { created: 2017-02-05T21:01:03.000Z,
             modified: 2017-02-05T21:01:03.000Z,
             accessed: 2017-12-14T09:43:12.000Z } },
        FileInfo {
          type: 192,
          flags: 3,
          reserved1: 0,
          nameLength: 15,
          nameHash: 14570,
          reserved2: 0,
          validSize: 11455,
          reserved3: <Buffer 00 00 00 00>,
          startCluster: 10,
          size: 11455 },
        FileName { type: 193, unknown1: 0, name: 'kinematics.html' },
        File {
          type: 133,
          continuations: 3,
          checksum: 45524,
          attr: 34,
          unknown1: 0,
          crtime: 19814,
          crdate: 19342,
          mtime: 19814,
          mdate: 19342,
          atime: 20600,
          adate: 19342,
          crtimeCs: 30,
          mtimeCs: 45,
          unknown2: <Buffer 00 00 00 00 00 00 00 00 00 00>,
          times:
           { created: 2017-12-14T09:43:12.300Z,
             modified: 2017-12-14T09:43:12.450Z,
             accessed: 2017-12-14T10:03:48.000Z } },
        FileInfo {
          type: 192,
          flags: 3,
          reserved1: 0,
          nameLength: 17,
          nameHash: 14783,
          reserved2: 0,
          validSize: 4096,
          reserved3: <Buffer 00 00 00 00>,
          startCluster: 9,
          size: 4096 },
        FileName { type: 193, unknown1: 0, name: '._kinematics.ht' },
        FileName { type: 193, unknown1: 0, name: 'ml' },
        File {
          type: 133,
          continuations: 2,
          checksum: 3753,
          attr: 50,
          unknown1: 0,
          crtime: 20572,
          crdate: 19342,
          mtime: 20572,
          mdate: 19342,
          atime: 20572,
          adate: 19342,
          crtimeCs: 79,
          mtimeCs: 81,
          unknown2: <Buffer 00 00 00 00 00 00 00 00 00 00>,
          times:
           { created: 2017-12-14T10:02:56.790Z,
             modified: 2017-12-14T10:02:56.810Z,
             accessed: 2017-12-14T10:02:56.000Z } },
        FileInfo {
          type: 192,
          flags: 3,
          reserved1: 0,
          nameLength: 8,
          nameHash: 13297,
          reserved2: 0,
          validSize: 4096,
          reserved3: <Buffer 00 00 00 00>,
          startCluster: 13,
          size: 4096 },
        FileName { type: 193, unknown1: 0, name: '.Trashes' } ] } }
```

</details>

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
