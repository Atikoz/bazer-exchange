import eng from './eng.json';
import ru from './ru.json';

type TranslationMap = typeof eng;
export type Language = 'eng' | 'ru';

const translation: Record<Language, TranslationMap> = {
  eng,
  ru,
};

const getTranslation = (lang: Language, nameString: keyof TranslationMap): string => {
  return translation[lang][nameString];
}

export default getTranslation;