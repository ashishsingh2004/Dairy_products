import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en/translation.json';
import hi from './locales/hi/translation.json';
import mr from './locales/mr/translation.json';
import ta from './locales/ta/translation.json';
import te from './locales/te/translation.json';
import kn from './locales/kn/translation.json';
import bn from './locales/bn/translation.json';
import gu from './locales/gu/translation.json';
import pa from './locales/pa/translation.json';
import ml from './locales/ml/translation.json';
import or from './locales/or/translation.json';
import as from './locales/as/translation.json';
import ur from './locales/ur/translation.json';

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            hi: { translation: hi },
            mr: { translation: mr },
            ta: { translation: ta },
            te: { translation: te },
            kn: { translation: kn },
            bn: { translation: bn },
            gu: { translation: gu },
            pa: { translation: pa },
            ml: { translation: ml },
            or: { translation: or },
            as: { translation: as },
            ur: { translation: ur },
        },
        lng: localStorage.getItem('language') || 'en',
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;

