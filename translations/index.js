const translation = {
  eng: require('./eng.json'),
  ru: require('./ru.json'),
}


const getTranslation = (lang, nameString) => {
  try {
    console.log('lang:', lang);
    console.log('nameString:', nameString);
    
    return translation[lang][nameString]
  } catch (error) {
    console.error(error.message)
  }
};

module.exports = getTranslation;