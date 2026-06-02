
with open(r'd:\agrifuturedo\frontend\src\pages\Dashboard_New.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix imports
content = content.replace(r'from "../context/LanguageContext"', r'from "../contexts/LanguageContext"')
content = content.replace(r'from "../components/layout/AppLayout"', r'from "../components/layouts/AppLayout"')

# Fix useLanguage usage
content = content.replace('const { lang, setLang } = useLanguage();', 'const { language, setLanguage } = useLanguage();')
content = content.replace('langs.indexOf(lang)', 'langs.indexOf(language)')
content = content.replace('setLang(nextLang)', 'setLanguage(nextLang)')
content = content.replace('currentLang={lang}', 'currentLang={language}')

with open(r'd:\agrifuturedo\frontend\src\pages\Dashboard_New.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('✅ Fixed Dashboard_New.jsx!')
