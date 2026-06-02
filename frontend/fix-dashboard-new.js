
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'Dashboard_New.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Fix imports
content = content.replace('from "../context/LanguageContext"', 'from "../contexts/LanguageContext"');
content = content.replace('from "../components/layout/AppLayout"', 'from "../components/layouts/AppLayout"');

// Fix useLanguage usage
content = content.replace('const { lang, setLang } = useLanguage();', 'const { language, setLanguage } = useLanguage();');
content = content.replace('langs.indexOf(lang)', 'langs.indexOf(language)');
content = content.replace('setLang(nextLang)', 'setLanguage(nextLang)');
content = content.replace('currentLang={lang}', 'currentLang={language}');

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Fixed Dashboard_New.jsx!');
