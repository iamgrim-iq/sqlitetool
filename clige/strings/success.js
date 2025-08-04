const { COLORS } = require('../core/colors');

const successMessages = {
    operation: {
        completed: (operation) => `${COLORS.GREEN}✅ Операция "${operation}" успешно завершена${COLORS.RESET}`,
        saved: (item) => `${COLORS.GREEN}💾 Сохранено: ${item}${COLORS.RESET}`,
        deleted: (item) => `${COLORS.GREEN}🗑️ Удалено: ${item}${COLORS.RESET}`,
        created: (item) => `${COLORS.GREEN}✨ Создано: ${item}${COLORS.RESET}`,
        updated: (item) => `${COLORS.GREEN}🔄 Обновлено: ${item}${COLORS.RESET}`,
        uploaded: (item) => `${COLORS.GREEN}⬆️ Загружено: ${item}${COLORS.RESET}`,
        downloaded: (item) => `${COLORS.GREEN}⬇️ Скачано: ${item}${COLORS.RESET}`
    },
    
    validation: {
        passed: () => `${COLORS.GREEN}✓ Все проверки пройдены${COLORS.RESET}`,
        valid: (field) => `${COLORS.GREEN}✓ Поле "${field}" корректно${COLORS.RESET}`,
        verified: () => `${COLORS.GREEN}🔒 Данные проверены и подтверждены${COLORS.RESET}`
    },
    
    authentication: {
        loggedIn: (user) => `${COLORS.GREEN}🔓 Добро пожаловать, ${user}!${COLORS.RESET}`,
        loggedOut: () => `${COLORS.GREEN}👋 Вы успешно вышли из системы${COLORS.RESET}`,
        authenticated: () => `${COLORS.GREEN}🔐 Аутентификация прошла успешно${COLORS.RESET}`,
        tokenRefreshed: () => `${COLORS.GREEN}🔄 Токен обновлен${COLORS.RESET}`
    },
    
    network: {
        connected: (host) => `${COLORS.GREEN}🌐 Подключение к ${host} установлено${COLORS.RESET}`,
        requestSent: () => `${COLORS.GREEN}📤 Запрос отправлен${COLORS.RESET}`,
        dataReceived: () => `${COLORS.GREEN}📥 Данные получены${COLORS.RESET}`,
        syncComplete: () => `${COLORS.GREEN}🔄 Синхронизация завершена${COLORS.RESET}`
    },
    
    installation: {
        packageInstalled: (pkg) => `${COLORS.GREEN}📦 Пакет "${pkg}" установлен${COLORS.RESET}`,
        dependenciesResolved: () => `${COLORS.GREEN}🔗 Все зависимости разрешены${COLORS.RESET}`,
        configurationSaved: () => `${COLORS.GREEN}⚙️ Конфигурация сохранена${COLORS.RESET}`,
        setupComplete: () => `${COLORS.GREEN}🎉 Настройка завершена!${COLORS.RESET}`
    },
    
    performance: {
        optimized: () => `${COLORS.GREEN}⚡ Оптимизация выполнена${COLORS.RESET}`,
        cacheCleared: () => `${COLORS.GREEN}🧹 Кэш очищен${COLORS.RESET}`,
        memoryFreed: (amount) => `${COLORS.GREEN}🧠 Освобождено памяти: ${amount}${COLORS.RESET}`,
        speedImproved: (percent) => `${COLORS.GREEN}🚀 Скорость увеличена на ${percent}%${COLORS.RESET}`
    },
    
    celebration: {
        awesome: () => `${COLORS.BRIGHT_GREEN}🎉 ПОТРЯСАЮЩЕ!${COLORS.RESET}`,
        perfect: () => `${COLORS.BRIGHT_GREEN}💎 ИДЕАЛЬНО!${COLORS.RESET}`,
        excellent: () => `${COLORS.BRIGHT_GREEN}⭐ ПРЕВОСХОДНО!${COLORS.RESET}`,
        legendary: () => `${COLORS.BRIGHT_GREEN}🏆 ЛЕГЕНДАРНО!${COLORS.RESET}`,
        godlike: () => `${COLORS.BRIGHT_GREEN}👑 БОЖЕСТВЕННО!${COLORS.RESET}`
    }
};

function formatSuccess(category, type, ...args) {
    const successFunc = successMessages[category]?.[type];
    if (typeof successFunc === 'function') {
        return successFunc(...args);
    }
    return `${COLORS.GREEN}✅ Операция выполнена успешно${COLORS.RESET}`;
}

module.exports = {
    successMessages,
    formatSuccess
};
