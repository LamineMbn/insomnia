'use strict';

module.exports.id = 'postman-environment';
module.exports.name = 'Postman Environment';
module.exports.description = 'Importer for Postman environments';

module.exports.convert = function(rawData) {
  let data;
  try {
    data = JSON.parse(rawData);
    if (data._postman_variable_scope === 'environment') {
      return importEnvironment(data);
    }
  } catch (e) {
    // Nothing
  }

  return null;
};

function importEnvironment(environment) {
  const newEnvironment = {
    _id: '__ENV_1__',
    _type: 'environment',
    name: environment.name || 'Postman Environment',
    data: {},
  };

  for (const value of environment.values) {
    if (!value.enabled) {
      continue;
    }
    let newKey, newValue;
    if (value.key.includes('.')) {
      ({ newKey, newValue } = convertNestedKey(value.key, value.value));
    } else {
      ({ newKey, newValue } = convertDashToUnderscore(value.key, value.value));
    }
    newEnvironment.data[newKey] = newValue;
  }

  return [newEnvironment];
}

function convertNestedKey(key, value) {
  const keys = key.split('.').map(key => convertDashInKey(key));
  const newKey = keys[0];
  const newValue = { [keys[1]]: convertDashInValue(value) };
  return { newKey, newValue };
}

function convertDashToUnderscore(key, value) {
  const newKey = convertDashInKey(key);
  const newValue = convertDashInValue(value);
  return { newKey, newValue };
}

function convertDashInValue(element) {
  let value = element;
  const matches = element.match(/\{\{(.*?)\}\}/g) || [];

  matches.map(match => {
    const newWord = convertDashInKey(match);
    value = value.replace(match, newWord);
  });

  return value;
}

function convertDashInKey(element) {
  const pattern = new RegExp('-', 'g');
  return element.replace(pattern, '_');
}
