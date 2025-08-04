const { COLORS } = require('../core/colors');

const prompts = {
    input: {
        enterValue: (field) => `${COLORS.CYAN}📝 Введите ${field}: ${COLORS.RESET}`,
        enterPassword: () => `${COLORS.CYAN}🔒 Введите пароль: ${COLORS.RESET}`,
        confirmPassword: () => `${COLORS.CYAN}🔒 Подтвердите пароль: ${COLORS.RESET}`,
        enterEmail: () => `${COLORS.CYAN}📧 Введите email: ${COLORS.RESET}`,
        enterUrl: () => `${COLORS.CYAN}🌐 Введите URL: ${COLORS.RESET}`,
        enterPath: () => `${COLORS.CYAN}📁 Введите путь к файлу: ${COLORS.RESET}`,
        enterNumber: (field) => `${COLORS.CYAN}🔢 Введите ${field}: ${COLORS.RESET}`
    },
    
    choice: {
        selectOption: () => `${COLORS.CYAN}🎯 Выберите опцию: ${COLORS.RESET}`,
        yesNo: () => `${COLORS.CYAN}❓ Да или нет? (y/n): ${COLORS.RESET}`,
        continueOperation: () => `${COLORS.CYAN}⏭️ Продолжить операцию? (y/n): ${COLORS.RESET}`,
        confirmAction: (action) => `${COLORS.YELLOW}⚠️ Подтвердите действие "${action}" (y/n): ${COLORS.RESET}`,
        selectFromList: () => `${COLORS.CYAN}📋 Выберите из списка: ${COLORS.RESET}`
    },
    
    confirmation: {
        deleteConfirm: (item) => `${COLORS.RED}🗑️ Удалить "${item}"? Это действие нельзя отменить! (y/n): ${COLORS.RESET}`,
        overwriteConfirm: (file) => `${COLORS.YELLOW}⚠️ Файл "${file}" уже существует. Перезаписать? (y/n): ${COLORS.RESET}`,
        proceedDangerous: () => `${COLORS.RED}💀 ЭТО ОПАСНАЯ ОПЕРАЦИЯ! Продолжить? (y/n): ${COLORS.RESET}`,
        factoryReset: () => `${COLORS.BRIGHT_RED}🔥 ВНИМАНИЕ! Сброс к заводским настройкам удалит ВСЕ данные! Продолжить? (y/n): ${COLORS.RESET}`
    },
    
    progress: {
        pleaseWait: () => `${COLORS.CYAN}⏳ Пожалуйста, подождите...${COLORS.RESET}`,
        processing: (item) => `${COLORS.CYAN}⚙️ Обрабатывается: ${item}...${COLORS.RESET}`,
        loading: () => `${COLORS.CYAN}📥 Загрузка...${COLORS.RESET}`,
        initializing: () => `${COLORS.CYAN}🚀 Инициализация...${COLORS.RESET}`,
        almostDone: () => `${COLORS.GREEN}🏁 Почти готово...${COLORS.RESET}`
    },
    
    navigation: {
        pressEnter: () => `${COLORS.DIM}⏎ Нажмите Enter для продолжения...${COLORS.RESET}`,
        useArrows: () => `${COLORS.DIM}⬆️⬇️ Используйте стрелки для навигации, Enter для выбора${COLORS.RESET}`,
        typeNumber: () => `${COLORS.DIM}🔢 Введите номер опции или используйте стрелки${COLORS.RESET}`,
        pressKey: (key) => `${COLORS.DIM}⌨️ Нажмите '${key}' для продолжения${COLORS.RESET}`,
        exitHint: (key = 'q') => `${COLORS.DIM}🚪 Нажмите '${key}' для выхода${COLORS.RESET}`
    },
    
    help: {
        availableCommands: () => `${COLORS.CYAN}📚 Доступные команды:${COLORS.RESET}`,
        usage: (command) => `${COLORS.CYAN}💡 Использование: ${command}${COLORS.RESET}`,
        examples: () => `${COLORS.CYAN}📝 Примеры:${COLORS.RESET}`,
        needHelp: () => `${COLORS.CYAN}❓ Нужна помощь? Введите 'help'${COLORS.RESET}`,
        documentation: () => `${COLORS.CYAN}📖 Подробная документация: https://github.com/user/clige${COLORS.RESET}`
    },
    
    status: {
        ready: () => `${COLORS.GREEN}🟢 Готов к работе${COLORS.RESET}`,
        busy: () => `${COLORS.YELLOW}🟡 Занят...${COLORS.RESET}`,
        offline: () => `${COLORS.RED}🔴 Недоступен${COLORS.RESET}`,
        connecting: () => `${COLORS.BLUE}🔄 Подключение...${COLORS.RESET}`,
        syncing: () => `${COLORS.CYAN}🔄 Синхронизация...${COLORS.RESET}`
    }
};

function getPrompt(category, type, ...args) {
    const promptFunc = prompts[category]?.[type];
    if (typeof promptFunc === 'function') {
        return promptFunc(...args);
    }
    return `${COLORS.CYAN}❓ Введите значение: ${COLORS.RESET}`;
}

module.exports = {
    prompts,
    getPrompt
};
