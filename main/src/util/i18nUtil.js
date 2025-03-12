const initI18n = (language, logger) => {
  const i18n = require('i18next')
  const en = require('../../asset/i18n/en.json')
  const tw = require('../../asset/i18n/zh-TW.json')

  logger.log('debug', 'env.language:%s', language)
  const resources = {
    'en': {
      translation: en
    },
    'zh-TW': {
      translation: tw
    }
  }

  i18n.init({
    resources,
    lng: language, // 預設語言
    fallbackLng: 'zh-TW', // 如果當前切換的語言沒有對應的翻譯則使用這個語言，
    interpolation: {
      escapeValue: false
    }
  })
}

module.exports = { initI18n }
