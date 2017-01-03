var file_seq = require('./../lib/index');
var assert = require('assert');
var fs = require('fs'); 
var path = require('path');
var del = require('del');

describe('generate(filepath, settings)', function(){
  var filepath1 = './logs/job.txt';
  var dir1 = path.dirname(filepath1);
  var filepath2 = './tmp/job.txt';
  var filepath3 = './logs/jobs/job.txt';
  /*
  describe('filepath', function(){
    it('filepath should be a string', function(){
      assert.throws(() => {
        file_seq.fileSeqNext(10, {});
      }, /filepath should be a string/);
      assert.throws(() => {
        file_seq.fileSeqNext(10, 10);
      }, /filepath should be a string/);
    });
    describe('filepath\'s directory', function(){
      before(function(){
        fs.mkdirSync(path.dirname(filepath1));
        fs.closeSync(fs.openSync(path.dirname(filepath3), 'w'));
      });
      it('filepath\'s directory should exist (it doesn\'t)', function(){
        assert.throws(() => {
          file_seq.fileSeqNext(filepath2, {});
        }, /filepath directory does not exist at/);
      });
      it('filepath\'s directory should be a directory', function(){
        assert.throws(() => {
          file_seq.fileSeqNext(filepath3, {});
        }, /filepath\'s directory is not a directory/);
      });
      after(function(){
        del.sync(path.join(dir1, '**'));
      });
    });
  });
  describe('settings', function(){
    it('settings should be an object', function(){
      assert.throws(() => {
        file_seq.fileSeqNext('file.txt', 10);
      }, /settings are not an object/) 
    });
  });
  */
  describe('generation without files', function(){
    /*
    before(function(){
      fs.mkdirSync(path.dirname(filepath1));
    });
    it('generate the next in the sequence', function(){
      file_seq.fileSeqNext(filepath1);
    });
    after(function(){
      del.sync(path.join(dir1, '**'));
    });
    */
  });
  describe('file sequence peek next filepath', function(){
    before(function(){
      fs.mkdirSync(path.dirname(filepath1));
    });
    it('generate the next in the sequence for max with one digit', function(){
      file_seq.fileSeqInit(filepath1);
      fs.closeSync(fs.openSync(filepath1 + '.1.gz', 'w'));
      fs.closeSync(fs.openSync(filepath1 + '.2', 'w'));
      fs.closeSync(fs.openSync(filepath1 + '.3', 'w'));
      fs.closeSync(fs.openSync(filepath1 + '.4', 'w'));
      assert.equal(file_seq.fileSeqPeekNext(filepath1), filepath1+'.5');
    });
    it('generate the next in the sequence for max with two digits', function(){
      file_seq.fileSeqInit(filepath1, { max: 30 });
      fs.closeSync(fs.openSync(filepath1 + '.09.gz', 'w'));
      fs.closeSync(fs.openSync(filepath1 + '.10.gz', 'w'));
      fs.closeSync(fs.openSync(filepath1 + '.11', 'w'));
      fs.closeSync(fs.openSync(filepath1 + '.12', 'w'));
      fs.closeSync(fs.openSync(filepath1 + '.13', 'w'));
      assert.equal(file_seq.fileSeqPeekNext(filepath1), filepath1+'.14');
    });
    it('generate the next in the sequence for max with three digits', function(){
      file_seq.fileSeqInit(filepath1, { max: 200 });
      fs.closeSync(fs.openSync(filepath1 + '.199.gz', 'w'));
      fs.closeSync(fs.openSync(filepath1 + '.001.gz', 'w'));
      fs.closeSync(fs.openSync(filepath1 + '.002', 'w'));
      fs.closeSync(fs.openSync(filepath1 + '.003', 'w'));
      fs.closeSync(fs.openSync(filepath1 + '.004', 'w'));
      assert.equal(file_seq.fileSeqPeekNext(filepath1), filepath1+'.005');
    });
    afterEach(function(){
      del.sync(filepath1+'*');
    });
    after(function(){
      del.sync(path.join(dir1, '**'));
    });
  });
  describe('file sequence generate next filepath', function(){
    before(function(){
      fs.mkdirSync(path.dirname(filepath1));
    });
    it('generate the next in the sequence for max with one digit and compress old', function(){
      file_seq.fileSeqInit(filepath1);
      fs.closeSync(fs.openSync(filepath1 + '.1.gz', 'w'));
      fs.closeSync(fs.openSync(filepath1 + '.2', 'w'));
      fs.closeSync(fs.openSync(filepath1 + '.3', 'w'));
      fs.closeSync(fs.openSync(filepath1 + '.4', 'w'));
      var filepathNewGen = file_seq.fileSeqNext(filepath1);
      assert.equal(true, fs.existsSync(filepath1+'.5'));
      assert.equal(true, fs.existsSync(filepath1+'.1.gz'));
      assert.equal(true, fs.existsSync(filepath1+'.2.gz'));
    });
    it('generate the next in the sequence for max with two digits and compress the old', function(){
      file_seq.fileSeqInit(filepath1, { max: 30 });
      fs.closeSync(fs.openSync(filepath1 + '.09.gz', 'w'));
      fs.closeSync(fs.openSync(filepath1 + '.10.gz', 'w'));
      fs.closeSync(fs.openSync(filepath1 + '.11', 'w'));
      fs.closeSync(fs.openSync(filepath1 + '.12', 'w'));
      fs.closeSync(fs.openSync(filepath1 + '.13', 'w'));
      var filepathNewGen = file_seq.fileSeqNext(filepath1);
      assert.equal(true, fs.existsSync(filepath1+'.14'), 'generation .14 should exist');
      assert.equal(false, fs.existsSync(filepath1+'.09.gz'), 'generation 09 should not exist');
    });
    it('generate the next 2 in the sequence for max with two digits, compress and remove the old', function(){
      file_seq.fileSeqInit(filepath1, { max: 30 });
      fs.closeSync(fs.openSync(filepath1 + '.09.gz', 'w'));
      fs.closeSync(fs.openSync(filepath1 + '.10.gz', 'w'));
      fs.closeSync(fs.openSync(filepath1 + '.11', 'w'));
      fs.closeSync(fs.openSync(filepath1 + '.12', 'w'));
      fs.closeSync(fs.openSync(filepath1 + '.13', 'w'));
      var filepathNewGen = file_seq.fileSeqNext(filepath1);
      var filepathNewGen = file_seq.fileSeqNext(filepath1);
      assert.equal(true, fs.existsSync(filepath1+'.15'), 'generation .15 should exist');
      assert.equal(true, fs.existsSync(filepath1+'.13'), 'generation .13 should exist');
      assert.equal(true, fs.existsSync(filepath1+'.12.gz'), 'generation .12 should be compressed');
      assert.equal(true, fs.existsSync(filepath1+'.11.gz'), 'generation .11 should be compressed');
      assert.equal(false, fs.existsSync(filepath1+'.10.gz'), 'generation 10 should not exist');
    });
    it('generate the next in the sequence for max with three digits', function(){
      file_seq.fileSeqInit(filepath1, { max: 200 });
      fs.closeSync(fs.openSync(filepath1 + '.199.gz', 'w'));
      fs.closeSync(fs.openSync(filepath1 + '.001.gz', 'w'));
      fs.closeSync(fs.openSync(filepath1 + '.002', 'w'));
      fs.closeSync(fs.openSync(filepath1 + '.003', 'w'));
      fs.closeSync(fs.openSync(filepath1 + '.004', 'w'));
      assert.equal(file_seq.fileSeqPeekNext(filepath1), filepath1+'.005');
    });
    afterEach(function(){
      del.sync(filepath1+'*');
    });
    after(function(){
      del.sync(path.join(dir1, '**'));
    });
  });
});
