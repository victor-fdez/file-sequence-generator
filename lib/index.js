/**
 * A NodeJS tool to generator a sequence of file names for logging
 *
 * @package file-sequence-generator
 */

var fs = require('fs'); 
var path = require('path');
var _ = require('lodash');
var jsonfile = require('jsonfile');
var settingsFile = require('./settings');
var checkSettings = settingsFile.checkSettings;
var getSettings = settingsFile.getSettings;
var getSettingsMaxNumDigits = settingsFile.getSettingsMaxNumDigits;
var getFilepathForGen = settingsFile.getFilepathForGen;
var genFile = require('./generations');
var getNewestSeq = genFile.getNewestSeq;
var getOldestSeq = genFile.getOldestSeq;
var getNOldestGens = genFile.getNOldestGens;
var removeNOldestGens = genFile.removeNOldestGens;
var gzipNOldestGens = genFile.gzipNOldestGens;
var getGens = genFile.getGens;

function checkIsDirectory(dirpath) {
  return checkIsDirectoryFail(dirpath, false);
};

function checkIsDirectoryFail(dirpath, fail = true) {
  if (!fs.existsSync(dirpath)) {
    if (fail)
      throw new Error('filepath directory does not exist at ' + dirpath);
    else
      return false;
  }
  var dirstat = fs.lstatSync(dirpath);
  if (!dirstat.isDirectory()) {
    if (fail)
      throw new Error('filepath\'s directory is not a directory ' + dirpath);
    else
      return false;
  }
  return true;
};

function setupSettings(filepath, settings) {
  /* check filepath is a string */
  if (typeof filepath !== 'string') {
    throw new Error('filepath should be a string');
  }
  /* check directories are setup correctly */
  var dir = path.dirname(filepath);
  checkIsDirectoryFail(dir);
  var base = path.basename(filepath);
  var settingsDir = path.join(dir, '.file-sequences');
  var settingsFilepath = path.join(settingsDir, base + '.json');
  if (fs.existsSync(settingsDir)) {
    if (!checkIsDirectory(settingsDir)) {
      throw new Error('the .file-sequences/ directory is not a directoy at ' + settingsDir);      
    }   
  } else {
    /* create the .file-sequences directory */
    fs.mkdirSync(settingsDir);
  }
  /* check base is not empty */
  /* get settings either from options or read from file */
  if (!_.isNil(settings)) {
    if (!_.isObject(settings)) {
      throw new Error('settings are not an object');
    }
    checkSettings(settings);
    /* set default values if not already there */
    _.set(settings,'keep',_.get(settings,'keep',3));
    _.set(settings,'compressed',_.get(settings,'compressed',2));
    _.set(settings,'max',_.get(settings,'max',6));
  } else {
    /* try to read settings from file */
    if (fs.existsSync(settingsFilepath)) {
      settings = jsonfile.readFileSync(settingsFilepath);
      checkSettings(settings);
    } else {
      settings = {
        keep: 3,
        compressed: 2,
        max: 6 
      };
    }
  }
  /* output settings */
  jsonfile.writeFileSync(settingsFilepath, settings, {spaces: 2});
  return settings;
};
function generateNext(filepath, settings) {
  settings = setupSettings(filepath, settings || {});
  var state = getGens(filepath, settings); 
}   

module.exports = {
  fileSeqNext: function(filepath) {
    var settings = getSettings(filepath);
    var currentGens = getGens(filepath, settings); 
    var numGens = _.size(currentGens);
    var maxGens = settings.keep + settings.compressed;
    /* if the maximum number of files in generations have been 
       reached the delete the oldest */
    //console.log(currentGens);
    if (numGens == maxGens) {
      removeNOldestGens(currentGens, 1, filepath, settings);
      numGens--;
    } 
    /* if there are file's to be compressed then compress them */
    var numGensCompressed = 0;
    var nextNumGens = numGens+1;
    if ( nextNumGens > settings.keep ) {
      /* if we get here then there must a number of compressed files else
         nextNumGens wouldn't be greter than settings.keep */
      numGensCompressed = nextNumGens - settings.keep;
      gzipNOldestGens(currentGens, numGensCompressed, filepath, settings);;
    }
    /* create the new file */
    var newestSeqNum = getNewestSeq(currentGens);
    var newGen = { sequenceNum: (newestSeqNum+1) % settings.max, compressed: false };
    var filepathNewGen = getFilepathForGen(filepath, settings, newGen);
    fs.closeSync(fs.openSync(filepathNewGen, "w"));
    return filepathNewGen;
  },
  fileSeqInit: function(filepath, settings = {}) {
    //console.log(setupSettings(filepath, settings));
    setupSettings(filepath, settings);
  },
  fileSeqPeekNext: function(filepath) {
    var settings = getSettings(filepath);
    var currentGens = getGens(filepath, settings); 
    //console.log(currentGens);
    /* no generations yet */
    if (!_.size(currentGens)) {
      return getFilepathForGen(filepath, settings, { sequenceNum: 0, compressed: false });
    } 
    /* there are previous generations */
    var newestSeqNum = getNewestSeq(currentGens);
    return getFilepathForGen(filepath, settings, { sequenceNum: (newestSeqNum+1) % settings.max, compressed: false });
  },
};

