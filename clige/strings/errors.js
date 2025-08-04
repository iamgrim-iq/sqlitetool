const { COLORS } = require('../core/colors');

const errorMessages = {
    validation: {
        required: (field) => `${COLORS.RED}✗ Поле "${field}" обязательно для заполнения${COLORS.RESET}`,
        invalid: (field, value) => `${COLORS.RED}✗ Недопустимое значение для "${field}": ${value}${COLORS.RESET}`,
        tooShort: (field, min) => `${COLORS.RED}✗ Поле "${field}" должно содержать минимум ${min} символов${COLORS.RESET}`,
        tooLong: (field, max) => `${COLORS.RED}✗ Поле "${field}" не должно превышать ${max} символов${COLORS.RESET}`,
        outOfRange: (field, min, max) => `${COLORS.RED}✗ Значение "${field}" должно быть от ${min} до ${max}${COLORS.RESET}`,
        invalidFormat: (field, format) => `${COLORS.RED}✗ Неверный формат для "${field}". Ожидается: ${format}${COLORS.RESET}`
    },
    
    file: {
        notFound: (path) => `${COLORS.RED}💀 Файл не найден: ${path}${COLORS.RESET}`,
        noAccess: (path) => `${COLORS.RED}🔒 Нет доступа к файлу: ${path}${COLORS.RESET}`,
        alreadyExists: (path) => `${COLORS.RED}⚠ Файл уже существует: ${path}${COLORS.RESET}`,
        corruptedFile: (path) => `${COLORS.RED}💥 Поврежденный файл: ${path}${COLORS.RESET}`,
        diskFull: () => `${COLORS.RED}💾 Недостаточно места на диске${COLORS.RESET}`,
        invalidPath: (path) => `${COLORS.RED}📁 Недопустимый путь: ${path}${COLORS.RESET}`
    },
    
    network: {
        connectionFailed: (host) => `${COLORS.RED}🌐 Не удалось подключиться к ${host}${COLORS.RESET}`,
        timeout: () => `${COLORS.RED}⏱️ Время ожидания истекло${COLORS.RESET}`,
        invalidUrl: (url) => `${COLORS.RED}🔗 Недопустимый URL: ${url}${COLORS.RESET}`,
        serverError: (code) => `${COLORS.RED}⚡ Ошибка сервера: ${code}${COLORS.RESET}`,
        unauthorized: () => `${COLORS.RED}🔐 Неавторизованный доступ${COLORS.RESET}`,
        rateLimited: () => `${COLORS.RED}🚫 Превышен лимит запросов${COLORS.RESET}`
    },
    
    system: {
        outOfMemory: () => `${COLORS.RED}🧠 Недостаточно памяти${COLORS.RESET}`,
        processKilled: (pid) => `${COLORS.RED}💀 Процесс ${pid} был завершен${COLORS.RESET}`,
        permissionDenied: () => `${COLORS.RED}🚫 Доступ запрещен${COLORS.RESET}`,
        commandNotFound: (cmd) => `${COLORS.RED}❌ Команда не найдена: ${cmd}${COLORS.RESET}`,
        dependencyMissing: (dep) => `${COLORS.RED}📦 Отсутствует зависимость: ${dep}${COLORS.RESET}`
    },
    
    user: {
        cancelled: () => `${COLORS.YELLOW}⚠ Операция отменена пользователем${COLORS.RESET}`,
        invalidChoice: () => `${COLORS.RED}🤔 Неверный выбор. Попробуйте снова.${COLORS.RESET}`,
        operationFailed: (operation) => `${COLORS.RED}💥 Операция "${operation}" завершилась неудачей${COLORS.RESET}`,
        notImplemented: () => `${COLORS.YELLOW}🚧 Функция еще не реализована${COLORS.RESET}`
    },
    
    generic: {
        unknown: () => `${COLORS.RED}❓ Произошла неизвестная ошибка${COLORS.RESET}`,
        critical: () => `${COLORS.BRIGHT_RED}💀 КРИТИЧЕСКАЯ ОШИБКА!${COLORS.RESET}`,
        fatal: () => `${COLORS.BRIGHT_RED}☠️ ФАТАЛЬНАЯ ОШИБКА! Аварийное завершение.${COLORS.RESET}`,
        tryAgain: () => `${COLORS.CYAN}🔄 Попробуйте еще раз${COLORS.RESET}`
    }
};

function formatError(category, type, ...args) {
    const errorFunc = errorMessages[category]?.[type];
    if (typeof errorFunc === 'function') {
        return errorFunc(...args);
    }
    return errorMessages.generic.unknown();
}

module.exports = {
    errorMessages,
    formatError
};
