var API3_URL = 'https://mf-chsdi3.dev.bgdi.ch/';

/**
 * This function detects is a string contains coordinates
 *
 */ 
var isCoordinates =  function(extent, query) {
  var DMSDegree = '[0-9]{1,2}[°|º]\\s*';
  var DMSMinute = '[0-9]{1,2}[\'|′]';
  var DMSSecond = '(?:\\b[0-9]+(?:\\.[0-9]*)?|\\.' +
  '[0-9]+\\b)("|\'\'|′′|″)';
  var DMSNorth = '[N]';
  var DMSEast = '[E]';
  var regexpDMSN = new RegExp(DMSDegree +
  '(' + DMSMinute + ')?\\s*' +
  '(' + DMSSecond + ')?\\s*' +
  DMSNorth, 'g');
  var regexpDMSE = new RegExp(DMSDegree +
  '(' + DMSMinute + ')?\\s*' +
  '(' + DMSSecond + ')?\\s*' +
  DMSEast, 'g');
  var regexpDMSDegree = new RegExp(DMSDegree, 'g');
  var regexpCoordinate = new RegExp(
  '([\\d\\.\']+)[\\s,]+([\\d\\.\']+)');

  var position;
  var valid = false;

  var matchDMSN = query.match(regexpDMSN);
  var matchDMSE = query.match(regexpDMSE);
  if (matchDMSN && matchDMSN.length == 1 &&
    matchDMSE && matchDMSE.length == 1) {
    var northing = parseFloat(matchDMSN[0].
    match(regexpDMSDegree)[0].
    replace('°' , '').replace('º' , ''));
    var easting = parseFloat(matchDMSE[0].
    match(regexpDMSDegree)[0].
    replace('°' , '').replace('º' , ''));
    var minuteN = matchDMSN[0].match(DMSMinute) ?
    matchDMSN[0].match(DMSMinute)[0] : '0';
    northing = northing +
    parseFloat(minuteN.replace('\'' , '').
      replace('′' , '')) / 60;
    var minuteE = matchDMSE[0].match(DMSMinute) ?
    matchDMSE[0].match(DMSMinute)[0] : '0';
    easting = easting +
    parseFloat(minuteE.replace('\'' , '').
      replace('′' , '')) / 60;
    var secondN =
    matchDMSN[0].match(DMSSecond) ?
    matchDMSN[0].match(DMSSecond)[0] : '0';
    northing = northing + parseFloat(secondN.replace('"' , '')
    .replace('\'\'' , '').replace('′′' , '')
    .replace('″' , '')) / 3600;
    var secondE = matchDMSE[0].match(DMSSecond) ?
    matchDMSE[0].match(DMSSecond)[0] : '0';
    easting = easting + parseFloat(secondE.replace('"' , '')
    .replace('\'\'' , '').replace('′′' , '')
    .replace('″' , '')) / 3600;
    position = ol.proj.transform([easting, northing],
      'EPSG:4326', 'EPSG:21781');
    if (ol.extent.containsCoordinate(
    extent, position)) {
      valid = true;
    }
  }

  var match =
    query.match(regexpCoordinate);
  if (match && !valid) {
    var left = parseFloat(match[1].replace('\'', ''));
    var right = parseFloat(match[2].replace('\'', ''));
    var position =
    [left > right ? left : right,
      right < left ? right : left];
    if (ol.extent.containsCoordinate(
      extent, position)) {
    valid = true;
    } else {
    position = ol.proj.transform(position,
      'EPSG:2056', 'EPSG:21781');
    if (ol.extent.containsCoordinate(
      extent, position)) {
      valid = true;
    } else {
      position =
      [left < right ? left : right,
        right > left ? right : left];
      position = ol.proj.transform(position,
      'EPSG:4326', 'EPSG:21781');
      if (ol.extent.containsCoordinate(
      extent, position)) {
      valid = true;
      }
    }
    }
  }
  return valid ?
    [Math.round(position[0] * 1000) / 1000,
    Math.round(position[1] * 1000) / 1000] : undefined;
};
