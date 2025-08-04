const { defaultTheme, applyTheme } = require('./default');
const { darkTheme } = require('./dark');
const { redbloodTheme } = require('./redblood');

const availableThemes = {
    default: defaultTheme,
    dark: darkTheme,
    redblood: redbloodTheme
};

function getTheme(themeName = 'default') {
    const theme = availableThemes[themeName];
    if (!theme) {
        console.warn(`Тема "${themeName}" не найдена. Используется тема по умолчанию.`);
        return applyTheme(defaultTheme);
    }
    return applyTheme(theme);
}

function listThemes() {
    return Object.keys(availableThemes).map(name => ({
        name,
        description: availableThemes[name].description
    }));
}

function createCustomTheme(baseTheme, overrides) {
    const base = availableThemes[baseTheme] || defaultTheme;
    const customTheme = JSON.parse(JSON.stringify(base));
    
    function mergeDeep(target, source) {
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                target[key] = target[key] || {};
                mergeDeep(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        }
    }
    
    mergeDeep(customTheme, overrides);
    return applyTheme(customTheme);
}

module.exports = {
    availableThemes,
    getTheme,
    listThemes,
    createCustomTheme,
    applyTheme
};
