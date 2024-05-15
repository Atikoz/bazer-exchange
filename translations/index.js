const translation = {
  eng: require('./eng.json'),
  ru: require('./ru.json'),
}


const getTranslation = (lang, nameString) => translation[lang][nameString];

module.exports = getTranslation;