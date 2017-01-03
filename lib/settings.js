var fs = require('fs'); 
var path = require('path');
var _ = require('lodash');
var jsonfile = require('jsonfile');

function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
};

function getSettingsDir(filepath) {
  var dir = path.dirname(filepath);
  var settingsDir = path.join(dir, '.file-sequences');
  return settingsDir;
};

function getSettingsFilepath(filepath) {
  var dir = path.dirname(filepath);
  var base = path.basename(filepath);
  var settingsDir = path.join(dir, '.file-sequences');
  var settingsFilepath = path.join(settingsDir, base + '.json');
  return settingsFilepath;
};

function getSettingsMaxNumDigits(settings) {
  return _.toString(settings.max).length;
};

function getFilepathForGen(filepath, settings, gen) {
  var padding = getSettingsMaxNumDigits(settings);
  var sequence = pad(gen.sequenceNum, padding);
  return filepath + '.' + sequence + (gen.compressed ? '.gz' : '');
};

function getSettings(filepath) {
  var settingsFilepath = getSettingsFilepath(filepath);
  if (!fs.existsSync(settingsFilepath)) {
    throw new Error(filepath + ' settings does not exist at ' + settingsFilepath);
  }
  var settings = jsonfile.readFileSync(settingsFilepath);
  checkSettings(settings);
  return settings;
};

function checkSettings(settings) {
  /* check settings */
  var allowedKeys = ['keep','compressed','max'];
  var keys = _.keys(settings);
  var forbiddenKeys = _.remove(keys, allowedKeys);
  if (_.size(forbiddenKeys) != 0) {
    throw new Error('the keys ' + forbiddenKeys + ' are not allowed');
  }
  var notNumberKeys = _.filter(settings, function(setting){ return !_.isNumber(setting); });
  if (_.size(notNumberKeys)){
    throw new Error('the keys ' + notNumberKeys + ' don\'t have expected number values');
  }
  /* check key values */
  if (settings.keep < 1) {
    throw new Error('setting\'s keep should be greater than  or equal to 1');
  }
  if (settings.compressed < 0) {
    throw new Error('setting\'s compressed should be greater than or equal to 0');
  }
  if (settings.max < 1) {
    throw new Error('setting\'s max should be greater than or equal to 1');
  }
  if (settings.max < settings.keep + settings.compressed + 1) {
    throw new Error('setting\'s max should be greater than keep + compressed');
  }
};

module.exports = {
  getSettingsDir: getSettingsDir,
  getSettingsFilepath: getSettingsFilepath,
  getSettingsMaxNumDigits: getSettingsMaxNumDigits,
  getFilepathForGen: getFilepathForGen,
  getSettings: getSettings,
  checkSettings: checkSettings,
};
