const { enableRawMode, disableRawMode } = require('../core/terminal');
const { COLORS } = require('../core/colors');

function readKey() {
    return new Promise((resolve) => {
        enableRawMode();
        process.stdin.setEncoding('utf8');
        
        process.stdin.once('data', (key) => {
            disableRawMode();
            resolve(key);
        });
    });
}

async function readLine(prompt = '', options = {}) {
    const {
        mask = null,
        defaultValue = '',
        validator = null,
        maxLength = null,
        allowEmpty = true
    } = options;

    while (true) {
        if (prompt) {
            process.stdout.write(prompt);
        }

        const input = await new Promise(resolve => {
            process.stdin.setEncoding('utf8');
            process.stdin.once('data', data => resolve(data.toString().trim()));
        });

        let value = input;

        if (!value && defaultValue) {
            value = defaultValue;
        }

        if (!allowEmpty && !value) {
            console.log(COLORS.RED + 'Поле не может быть пустым!' + COLORS.RESET);
            continue;
        }

        if (maxLength && value.length > maxLength) {
            console.log(COLORS.RED + `Максимальная длина: ${maxLength} символов!` + COLORS.RESET);
            continue;
        }

        if (validator && !validator(value)) {
            console.log(COLORS.RED + 'Некорректное значение!' + COLORS.RESET);
            continue;
        }

        return value;
    }
}

function readPassword(prompt = 'Пароль: ', options = {}) {
    const { minLength = 0, confirmPassword = false } = options;
    
    return new Promise((resolve) => {
        process.stdout.write(prompt);
        
        enableRawMode();
        process.stdin.setEncoding('utf8');
        
        let password = '';
        
        const handleKeypress = (key) => {
            switch (key) {
                case '\r':
                case '\n':
                    disableRawMode();
                    process.stdin.removeListener('data', handleKeypress);
                    process.stdout.write('\n');
                    
                    if (password.length < minLength) {
                        console.log(COLORS.RED + `Минимальная длина пароля: ${minLength} символов!` + COLORS.RESET);
                        return resolve(readPassword(prompt, options));
                    }
                    
                    if (confirmPassword) {
                        return resolve(confirmPasswordInput(password, options));
                    }
                    
                    resolve(password);
                    break;
                    
                case '\u0003':
                    disableRawMode();
                    process.stdin.removeListener('data', handleKeypress);
                    process.exit(0);
                    break;
                    
                case '\u007f':
                case '\b':
                    if (password.length > 0) {
                        password = password.slice(0, -1);
                        process.stdout.write('\b \b');
                    }
                    break;
                    
                default:
                    if (key.charCodeAt(0) >= 32 && key.charCodeAt(0) <= 126) {
                        password += key;
                        process.stdout.write('*');
                    }
                    break;
            }
        };
        
        process.stdin.on('data', handleKeypress);
    });
}

function confirmPasswordInput(originalPassword, options) {
    return readPassword('Подтвердите пароль: ', { ...options, confirmPassword: false })
        .then(confirmPassword => {
            if (originalPassword !== confirmPassword) {
                console.log(COLORS.RED + 'Пароли не совпадают!' + COLORS.RESET);
                return readPassword('Пароль: ', options);
            }
            return originalPassword;
        });
}

async function readNumber(prompt = '', options = {}) {
    const {
        min = null,
        max = null,
        integer = false,
        defaultValue = null
    } = options;

    while (true) {
        const input = await readLine(prompt, { defaultValue: defaultValue?.toString() });

        if (!input && defaultValue !== null) {
            return defaultValue;
        }

        const number = integer ? parseInt(input, 10) : parseFloat(input);

        if (isNaN(number)) {
            console.log(COLORS.RED + 'Введите корректное число!' + COLORS.RESET);
            continue;
        }

        if (min !== null && number < min) {
            console.log(COLORS.RED + `Минимальное значение: ${min}` + COLORS.RESET);
            continue;
        }

        if (max !== null && number > max) {
            console.log(COLORS.RED + `Максимальное значение: ${max}` + COLORS.RESET);
            continue;
        }

        return number;
    }
}

async function readBoolean(prompt = '', options = {}) {
    const {
        trueValues = ['y', 'yes', 'да', 'д', '1', 'true'],
        falseValues = ['n', 'no', 'нет', 'н', '0', 'false'],
        defaultValue = null
    } = options;
    
    const fullPrompt = defaultValue !== null ? 
        `${prompt} (${defaultValue ? 'Y/n' : 'y/N'}): ` : 
        `${prompt} (y/n): `;

    while (true) {
        const input = await readLine(fullPrompt);
        const lowercaseInput = input.toLowerCase();

        if (!input && defaultValue !== null) {
            return defaultValue;
        }

        if (trueValues.includes(lowercaseInput)) {
            return true;
        }

        if (falseValues.includes(lowercaseInput)) {
            return false;
        }

        console.log(COLORS.RED + 'Введите y (да) или n (нет)!' + COLORS.RESET);
    }
}

async function readChoice(prompt, choices, options = {}) {
    const {
        caseSensitive = false,
        showChoices = true,
        defaultValue = null
    } = options;

    if (showChoices) {
        const choicesList = choices.map((choice, index) =>
            `${index + 1}. ${choice}`
        ).join('\n');
        console.log(choicesList);
    }

    const fullPrompt = defaultValue !== null ?
        `${prompt} (по умолч.: ${defaultValue}): ` :
        `${prompt}: `;

    while (true) {
        const input = await readLine(fullPrompt);

        if (!input && defaultValue !== null) {
            return defaultValue;
        }

        const numberInput = parseInt(input, 10);
        if (!isNaN(numberInput) && numberInput >= 1 && numberInput <= choices.length) {
            return choices[numberInput - 1];
        }

        const searchInput = caseSensitive ? input : input.toLowerCase();
        const matchedChoice = choices.find(choice => {
            const choiceToCheck = caseSensitive ? choice : choice.toLowerCase();
            return choiceToCheck === searchInput;
        });

        if (matchedChoice) {
            return matchedChoice;
        }

        console.log(COLORS.RED + 'Неверный выбор!' + COLORS.RESET);
    }
}

function readMultiline(prompt = '', options = {}) {
    const { endMarker = 'END', showInstructions = true } = options;
    
    if (showInstructions) {
        console.log(`${prompt}\n${COLORS.DIM}(Введите '${endMarker}' на новой строке для завершения)${COLORS.RESET}`);
    }
    
    return new Promise((resolve) => {
        const lines = [];
        
        const handleLine = (input) => {
            const line = input.toString().replace(/\r?\n$/, '');
            
            if (line === endMarker) {
                process.stdin.removeListener('data', handleLine);
                resolve(lines.join('\n'));
            } else {
                lines.push(line);
            }
        };
        
        process.stdin.setEncoding('utf8');
        process.stdin.on('data', handleLine);
    });
}

function waitForEnter(message = 'Нажмите Enter для продолжения...') {

    process.stdout.write(COLORS.DIM + message + COLORS.RESET);
    return new Promise((resolve) => {

        const onData = () => {
            process.stdin.removeListener('data', onData);
            resolve();
        };
        process.stdin.on('data', onData);
    });
}

function createProgressiveInput(fields) {
    const results = {};
    
    async function processField(fieldIndex = 0) {
        if (fieldIndex >= fields.length) {
            return results;
        }
        
        const field = fields[fieldIndex];
        const { name, prompt, type = 'text', ...options } = field;
        
        let value;
        
        switch (type) {
            case 'password':
                value = await readPassword(prompt, options);
                break;
            case 'number':
                value = await readNumber(prompt, options);
                break;
            case 'boolean':
                value = await readBoolean(prompt, options);
                break;
            case 'choice':
                value = await readChoice(prompt, field.choices, options);
                break;
            case 'multiline':
                value = await readMultiline(prompt, options);
                break;
            default:
                value = await readLine(prompt, options);
                break;
        }
        
        results[name] = value;
        
        if (field.onComplete) {
            field.onComplete(value, results);
        }
        
        return processField(fieldIndex + 1);
    }
    
    return processField();
}

module.exports = {
    readKey,
    readLine,
    readPassword,
    readNumber,
    readBoolean,
    readChoice,
    readMultiline,
    waitForEnter,
    createProgressiveInput
};
