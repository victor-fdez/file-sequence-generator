# file-sequence-generator

## A NodeJS tool to generator a sequence of file names for logging (also compressed old files)

[![MIT licensed](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/hyperium/hyper/master/LICENSE) [![CircleCI](https://circleci.com/gh/victor-fdez/file-sequence-generator.svg?style=svg)](https://circleci.com/gh/victor-fdez/file-sequence-generator) 

Sometimes you need to keep versions of logs as you a script several times, or every time you restart your server. After a while you might also want to remove old logs, or compressed and after certain while remove them. This package includes several function that will allow you to do this from within your NodeJS code. 

### Installation

```bash
npm install --save file-sequence-generator
```

### Example

```javascript
var fileSeq = require('file-sequence-generator');
// logs folder must exists already
var filepath = './logs/myjob.txt';
// get the functions from file-sequence-generator
var fileSeqInit = fileSeq.fileSeqInit;
var fileSeqNext = fileSeq.fileSeqNext;
// initialize the generator settings within ./logs/.file-sequences/myjob.txt.json as JSON
fileSeqInit(filepath, { keep: 2, compressed: 3, max: 10});
// generate the file ./logs/myjob.txt.01 as the first in the sequence
fileSeqNext(filepath);
// if you call fileSeqNext 3 more times you will end up with 4 files
//   ./logs/myjob.txt.01.gz <-- stores this file as compressed
//   ./logs/myjob.txt.02.gz <-- stores this file as compressed 
//   ./logs/myjob.txt.03    <-- keeps the original file
//   ./logs/myjob.txt.04    <-- and so one
// based on the settings it will try to keep 3 compressed file and 2 uncompressed
// and when it gets to file ./logs/myjob.txt.09 it will loop around to .00 and so 
// til infinitum.
```

### Test

```bash
npm run test
```
### Pull Request

please look at the `PULL_REQUEST_TEMPLATE.md`
