var _ = require('lodash');
var path = require('path');
var fs = require('fs');
var zlib = require('zlib');
var settingsFile = require('./settings');
var getFilepathForGen = settingsFile.getFilepathForGen;
var getSettingsMaxNumDigits = settingsFile.getSettingsMaxNumDigits;

var generation = module.exports = {
  getFilename: function(filepath, gen) {
  },
  getFilenames: function(regexString, filepath) {
    var dir = path.dirname(filepath);
    var regex = new RegExp(regexString);
    var files = fs.readdirSync(dir);
    var matchFiles = _.filter(files, function(filename){ return filename.match(regex); });
    return matchFiles;
  },
  getGensCompressedFilenames: function(filepath, settings) {
    var base = path.basename(filepath);
    var sequenceExp = '[0-9]' + '{1,' + getSettingsMaxNumDigits(settings) + '}';
    return generation.getFilenames('^'+base+'\.'+sequenceExp+'\.gz$', filepath);
  },
  getGensNormalFilenames: function(filepath, settings) {
    var base = path.basename(filepath);
    var sequenceExp = '[0-9]' + '{1,' + getSettingsMaxNumDigits(settings) + '}';
    return generation.getFilenames('^'+base+'\.'+sequenceExp+'$', filepath);
  },
  getGens: function(filepath, settings) {
    var seqFiles = generation.getGensNormalFilenames(filepath, settings);
    var seqCompressedFiles = generation.getGensCompressedFilenames(filepath, settings);
    var seqFiles = _.concat(seqFiles, seqCompressedFiles);
    var seq = _.map(seqFiles, function(value){
      var isCompressed = _.endsWith(value,'.gz');
      var tokens = _.split(value,'.');
      var sequenceNumString;
      if (isCompressed) {
        sequenceNumString = tokens[tokens.length - 2];;
      } else {
        sequenceNumString = tokens[tokens.length - 1];
      }
      return {
        sequenceNum: _.toInteger(sequenceNumString),
        compressed: isCompressed
      };
    });
    seq = _.sortBy(seq, function(value){ return value.sequenceNum; });
    return seq;
  },
  getOldestSeq: function(gens) {
    /* if there are no generations */
    if (gens.length == 0) {
      return 0;
    }
    /* if we only have generation then that is the oldest and the newest */
    if (gens.length == 1) {
      return gens[0].sequenceNum;
    }
    /* else we get a sorted array of the generations sequence nums */
    var i = 0;
    var seqs = _.map(gens, function(gen){ return gen.sequenceNum; }); 
    for( i = seqs.length - 1 ; i >=0 ; i-- ){
      /* if all satisfied then the first one is the oldest 
       *  eg. [ 3 4 5 ] here 3 would be the oldest */
      if ( i == 0 ) {
        return seqs[0];
      }
      if ( seqs[i]-1 != seqs[i-1] ) {
        /* the oldest seq will be the one that doesn't have a previous
         * entry in the array with a value equal to it's value - 1 
         * eg. [ 0 1 4 5 ] here 4 would be the oldest */
        return seqs[i];
      }
    }
  },
  getNewestSeq: function(gens) {
    /* if there are no generations */
    if (gens.length == 0) {
      return 0;
    }
    /* if we only have generation then that is the oldest and the newest */
    if (gens.length == 1) {
      return gens[0].sequenceNum;
    }
    /* else we get a sorted array of the generations sequence nums */
    var i = 0;
    var seqs = generation.getSeqs(gens); 
    for( i = 0; i < seqs.length; i++ ) {
      /* if all satisfied then the last one is the newest 
       *  eg. [ 3 4 5 ] here 5 would be the newest */
      if ( i == seqs.length-1 ) {
        return seqs[seqs.length-1];
      }
      if ( seqs[i]+1 != seqs[i+1] ) {
        /* the newest seq will be the one that doesn't have a next 
         * entry in the array with a value equal to it's value + 1 
         * eg. [ 0 1 4 5 ] here 4 would be the newest */
        return seqs[i];
      }
    }
  },
  getSeqs: function(gens) {
    var seqs = _.map(gens, function(gen){ return gen.sequenceNum; }); 
    return seqs;
  },
  getNOldestGens: function(gens, n) {
    n = n > gens.length ? gens.length : n;
    var seqs = generation.getSeqs(gens); 
    var oldestSeq = generation.getOldestSeq(gens);
    var oldestIndex = _.indexOf(seqs, oldestSeq);
    var oldest = [];
    var i;
    for (i=0; i<n; i++){
      var index = (oldestIndex+i) % gens.length;
      oldest.push(gens[index]);
    }
    return oldest;
  },
  removeNOldestGens: function(gens, n, filepath, settings) {
    n = n > gens.length ? gens.length : n;
    var seqs = generation.getSeqs(gens); 
    var oldestSeq = generation.getOldestSeq(gens);
    var oldestIndex = _.indexOf(seqs, oldestSeq);
    var oldest = [];
    var i;
    for (i=0; i<n; i++){
      /* index will wrap around as more gens are deleted */
      var index = oldestIndex % gens.length;
      var oldGen = gens.splice(index, 1); 
      var filepathOld = getFilepathForGen(filepath, settings, oldGen[0]);
      fs.unlinkSync(filepathOld);
    }
    return gens;
  },
  gzipGen: function(gen, filepath, settings) {
    var filepathGen = getFilepathForGen(filepath, settings, gen);
    gen.compressed = true;
    var filepathGenCompressed = getFilepathForGen(filepath, settings, gen);
    var buffer = fs.readFileSync(filepathGen);   
    buffer = zlib.gzipSync(buffer);
    fs.writeFileSync(filepathGenCompressed, buffer);
    fs.unlinkSync(filepathGen);
  },
  gzipNOldestGens: function(gens, n, filepath, settings) {
    n = n > gens.length ? gens.length : n;
    var seqs = generation.getSeqs(gens); 
    var oldestSeq = generation.getOldestSeq(gens);
    var oldestIndex = _.indexOf(seqs, oldestSeq);
    var oldest = [];
    var i;
    for (i=0; i<n; i++){
      /* index will wrap around as more gens are deleted */
      var index = (oldestIndex+i) % gens.length;
      var gen = gens[index];
      if (!gen.compressed) {
        generation.gzipGen(gen, filepath, settings)
      }
    }
    return gens;
  },
  getNumGensCompressed(gens){
    var i;
    var numCompressed = 0;
    for(i=0; i<gens.length; i++){
      if (gens[i].compressed) {
        numCompressed++;
      }
    }
    return numCompressed;
  },
};
