const { stripAnsi } = require('../core/renderer');

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validateUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

function validateIPAddress(ip) {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

function validatePhoneNumber(phone, country = 'RU') {
    const cleanPhone = phone.replace(/\D/g, '');
    
    const patterns = {
        RU: /^[78]\d{10}$/,
        US: /^1\d{10}$/,
        INTERNATIONAL: /^\d{7,15}$/
    };
    
    return patterns[country] ? patterns[country].test(cleanPhone) : patterns.INTERNATIONAL.test(cleanPhone);
}

function validatePassword(password, options = {}) {
    const {
        minLength = 8,
        requireUppercase = true,
        requireLowercase = true,
        requireNumbers = true,
        requireSpecialChars = false,
        forbiddenChars = []
    } = options;
    
    const errors = [];
    
    if (password.length < minLength) {
        errors.push(`Минимальная длина: ${minLength} символов`);
    }
    
    if (requireUppercase && !/[A-Z]/.test(password)) {
        errors.push('Требуется хотя бы одна заглавная буква');
    }
    
    if (requireLowercase && !/[a-z]/.test(password)) {
        errors.push('Требуется хотя бы одна строчная буква');
    }
    
    if (requireNumbers && !/\d/.test(password)) {
        errors.push('Требуется хотя бы одна цифра');
    }
    
    if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Требуется хотя бы один специальный символ');
    }
    
    for (const char of forbiddenChars) {
        if (password.includes(char)) {
            errors.push(`Символ '${char}' запрещен`);
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors,
        strength: calculatePasswordStrength(password)
    };
}

function calculatePasswordStrength(password) {
    let score = 0;
    
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
    if (password.length >= 16) score += 1;
    
    const uniqueChars = new Set(password).size;
    if (uniqueChars >= password.length * 0.7) score += 1;
    
    if (score <= 2) return 'weak';
    if (score <= 4) return 'medium';
    if (score <= 6) return 'strong';
    return 'very_strong';
}

function validateFilePath(path, options = {}) {
    const { mustExist = false, allowedExtensions = null, forbiddenChars = ['<', '>', ':', '"', '|', '?', '*'] } = options;
    
    const errors = [];
    
    for (const char of forbiddenChars) {
        if (path.includes(char)) {
            errors.push(`Недопустимый символ: '${char}'`);
        }
    }
    
    if (allowedExtensions) {
        const ext = path.split('.').pop().toLowerCase();
        if (!allowedExtensions.includes(ext)) {
            errors.push(`Допустимые расширения: ${allowedExtensions.join(', ')}`);
        }
    }
    
    if (mustExist) {
        try {
            require('fs').accessSync(path);
        } catch {
            errors.push('Файл не существует');
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

function validateRange(value, min, max, type = 'number') {
    const errors = [];
    
    if (type === 'number') {
        const num = parseFloat(value);
        if (isNaN(num)) {
            errors.push('Должно быть числом');
        } else {
            if (min !== null && num < min) errors.push(`Минимальное значение: ${min}`);
            if (max !== null && num > max) errors.push(`Максимальное значение: ${max}`);
        }
    } else if (type === 'string') {
        const length = stripAnsi(value).length;
        if (min !== null && length < min) errors.push(`Минимальная длина: ${min} символов`);
        if (max !== null && length > max) errors.push(`Максимальная длина: ${max} символов`);
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

function validateRequired(value, fieldName = 'Поле') {
    const isEmpty = value === null || value === undefined || 
                   (typeof value === 'string' && stripAnsi(value).trim() === '') ||
                   (Array.isArray(value) && value.length === 0);
    
    return {
        isValid: !isEmpty,
        errors: isEmpty ? [`${fieldName} обязательно для заполнения`] : []
    };
}

function validateRegex(value, pattern, errorMessage = 'Неверный формат') {
    const isValid = pattern.test(value);
    
    return {
        isValid,
        errors: isValid ? [] : [errorMessage]
    };
}

function validateDate(dateString, options = {}) {
    const { format = 'YYYY-MM-DD', minDate = null, maxDate = null } = options;
    
    const errors = [];
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
        errors.push('Неверный формат даты');
    } else {
        if (minDate && date < new Date(minDate)) {
            errors.push(`Дата не может быть раньше ${minDate}`);
        }
        
        if (maxDate && date > new Date(maxDate)) {
            errors.push(`Дата не может быть позже ${maxDate}`);
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors,
        parsedDate: errors.length === 0 ? date : null
    };
}

function validateJSON(jsonString) {
    try {
        const parsed = JSON.parse(jsonString);
        return {
            isValid: true,
            errors: [],
            parsed
        };
    } catch (error) {
        return {
            isValid: false,
            errors: ['Некорректный JSON формат'],
            parsed: null
        };
    }
}

function validateCreditCard(cardNumber) {
    const cleanNumber = cardNumber.replace(/\D/g, '');
    
    if (cleanNumber.length < 13 || cleanNumber.length > 19) {
        return {
            isValid: false,
            errors: ['Неверная длина номера карты'],
            cardType: null
        };
    }
    
    const cardTypes = {
        visa: /^4/,
        mastercard: /^5[1-5]/,
        amex: /^3[47]/,
        discover: /^6(?:011|5)/,
        mir: /^220[0-4]/
    };
    
    let cardType = null;
    for (const [type, pattern] of Object.entries(cardTypes)) {
        if (pattern.test(cleanNumber)) {
            cardType = type;
            break;
        }
    }
    
    const isValidLuhn = luhnCheck(cleanNumber);
    
    return {
        isValid: isValidLuhn,
        errors: isValidLuhn ? [] : ['Неверный номер карты'],
        cardType
    };
}

function luhnCheck(cardNumber) {
    const digits = cardNumber.split('').reverse().map(Number);
    let sum = 0;
    
    for (let i = 0; i < digits.length; i++) {
        let digit = digits[i];
        
        if (i % 2 === 1) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        
        sum += digit;
    }
    
    return sum % 10 === 0;
}

function createValidator(rules) {
    return function(data) {
        const results = {};
        let isValid = true;
        
        for (const [field, fieldRules] of Object.entries(rules)) {
            const value = data[field];
            const fieldResult = {
                isValid: true,
                errors: []
            };
            
            for (const rule of fieldRules) {
                const ruleResult = rule(value, field);
                
                if (!ruleResult.isValid) {
                    fieldResult.isValid = false;
                    fieldResult.errors.push(...ruleResult.errors);
                    isValid = false;
                }
            }
            
            results[field] = fieldResult;
        }
        
        return {
            isValid,
            fields: results,
            errors: Object.values(results)
                .filter(field => !field.isValid)
                .flatMap(field => field.errors)
        };
    };
}

module.exports = {
    validateEmail,
    validateUrl,
    validateIPAddress,
    validatePhoneNumber,
    validatePassword,
    calculatePasswordStrength,
    validateFilePath,
    validateRange,
    validateRequired,
    validateRegex,
    validateDate,
    validateJSON,
    validateCreditCard,
    luhnCheck,
    createValidator
};
