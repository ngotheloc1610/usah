import i18next from 'i18next';
import en from './locales/en'
import jp from './locales/jp'
import { initReactI18next } from 'react-i18next'

const I18n = i18next
  .use(initReactI18next)
  .init({
    lng: 'en',
    resources: {
      en,
      jp
    }
  });

export default I18n;
