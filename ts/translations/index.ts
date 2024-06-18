const translation: object = {
  eng: require('./eng.json'),
  ru: require('./ru.json'),
}


const getTranslation = (lang: string, nameString: string): string => translation[lang][nameString];

export default getTranslation;