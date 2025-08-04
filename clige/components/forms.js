const { drawBox } = require('./boxes');
const { readLine, readPassword, readNumber, readBoolean, readChoice, readMultiline } = require('../utils/input');
const { COLORS } = require('../core/colors');
const { validateRequired, validateEmail, validateRange } = require('../utils/validation');

function createForm(fields, options = {}) {
    const {
        title = 'Форма ввода данных',
        showProgress = true,
        validateOnInput = false,
        theme = 'default',
        boxOptions = {}
    } = options;
    
    const results = {};
    const errors = {};
    
    async function processForm() {
        console.clear();
        
        if (title) {
            const formTitle = drawBox(title, {
                color: COLORS.CYAN + COLORS.BOLD,
                borderStyle: 'double',
                align: 'center',
                ...boxOptions
            });
            console.log(formTitle + '\n');
        }
        
        for (let i = 0; i < fields.length; i++) {
            const field = fields[i];
            
            if (showProgress) {
                const progress = `[${i + 1}/${fields.length}]`;
                console.log(COLORS.DIM + progress + COLORS.RESET);
            }
            
            const result = await processField(field, results);
            
            if (result.success) {
                results[field.name] = result.value;
                delete errors[field.name];
            } else {
                errors[field.name] = result.errors;
                if (field.required !== false) {
                    i--;
                }
            }
            
            console.log();
        }
        
        return {
            data: results,
            errors: Object.keys(errors).length > 0 ? errors : null,
            isValid: Object.keys(errors).length === 0
        };
    }
    
    return processForm();
}

async function processField(field, existingData = {}) {
    const {
        name,
        label,
        type = 'text',
        required = true,
        defaultValue,
        validation = [],
        dependsOn,
        conditional,
        ...fieldOptions
    } = field;
    
    if (conditional && !conditional(existingData)) {
        return { success: true, value: defaultValue || null };
    }
    
    if (dependsOn && !existingData[dependsOn]) {
        return { success: true, value: defaultValue || null };
    }
    
    const prompt = label || `Введите ${name}:`;
    let value;
    const errors = [];
    
    try {
        switch (type) {
            case 'text':
            case 'string':
                value = await readLine(`${COLORS.CYAN}${prompt}${COLORS.RESET} `, {
                    defaultValue,
                    ...fieldOptions
                });
                break;
                
            case 'password':
                value = await readPassword(`${COLORS.CYAN}${prompt}${COLORS.RESET} `, {
                    ...fieldOptions
                });
                break;
                
            case 'number':
            case 'integer':
                value = await readNumber(`${COLORS.CYAN}${prompt}${COLORS.RESET} `, {
                    defaultValue,
                    integer: type === 'integer',
                    ...fieldOptions
                });
                break;
                
            case 'boolean':
                value = await readBoolean(`${COLORS.CYAN}${prompt}${COLORS.RESET}`, {
                    defaultValue,
                    ...fieldOptions
                });
                break;
                
            case 'choice':
            case 'select':
                value = await readChoice(`${COLORS.CYAN}${prompt}${COLORS.RESET}`, field.choices || [], {
                    defaultValue,
                    ...fieldOptions
                });
                break;
                
            case 'multiline':
            case 'textarea':
                value = await readMultiline(`${COLORS.CYAN}${prompt}${COLORS.RESET}`, {
                    ...fieldOptions
                });
                break;
                
            default:
                value = await readLine(`${COLORS.CYAN}${prompt}${COLORS.RESET} `, {
                    defaultValue,
                    ...fieldOptions
                });
        }
        
        if (required) {
            const requiredCheck = validateRequired(value, label || name);
            if (!requiredCheck.isValid) {
                errors.push(...requiredCheck.errors);
            }
        }
        
        if (validation.length > 0 && value) {
            for (const validator of validation) {
                const result = validator(value, existingData); 
                if (!result.isValid) {
                    errors.push(...result.errors);
                }
            }
        }
        
        if (errors.length > 0) {
            errors.forEach(error => {
                console.log(`${COLORS.RED}✗ ${error}${COLORS.RESET}`);
            });
            return { success: false, errors };
        }
        
        if (field.onSuccess) {
            field.onSuccess(value, existingData);
        }
        
        return { success: true, value };
        
    } catch (error) {
        return { 
            success: false, 
            errors: [`Ошибка ввода: ${error.message}`] 
        };
    }
}

function createMultiStepForm(steps, options = {}) {
    const {
        title = 'Многошаговая форма',
        showStepProgress = true,
        allowBack = true,
        skipEmptySteps = false
    } = options;
    
    const results = {};
    let currentStep = 0;
    
    async function processSteps() {
        while (currentStep < steps.length) {
            const step = steps[currentStep];
            
            console.clear();
            
            if (showStepProgress) {
                const progress = `Шаг ${currentStep + 1} из ${steps.length}: ${step.title || 'Без названия'}`;
                const progressBox = drawBox(progress, {
                    color: COLORS.BLUE,
                    align: 'center'
                });
                console.log(progressBox + '\n');
            }
            
            if (step.description) {
                console.log(COLORS.DIM + step.description + COLORS.RESET + '\n');
            }
            
            const stepResult = await createForm(step.fields || [], {
                title: step.title,
                showProgress: false,
                ...step.options
            });
            
            if (stepResult.isValid) {
                Object.assign(results, stepResult.data);
                
                if (step.onComplete) {
                    const shouldContinue = await step.onComplete(stepResult.data, results);
                    if (shouldContinue === false) break;
                }
                
                currentStep++;
            } else {
                console.log(`${COLORS.RED}❌ Ошибки в форме:${COLORS.RESET}`);
                if (stepResult.errors) {
                    Object.values(stepResult.errors).forEach(fieldErrors => {
                        fieldErrors.forEach(error => {
                            console.log(`${COLORS.RED}  • ${error}${COLORS.RESET}`);
                        });
                    });
                }
                
                if (allowBack && currentStep > 0) {
                    console.log(`\n${COLORS.YELLOW}Выберите действие:${COLORS.RESET}`);
                    console.log(`${COLORS.CYAN}[1]${COLORS.RESET} Повторить текущий шаг`);
                    console.log(`${COLORS.CYAN}[2]${COLORS.RESET} Вернуться к предыдущему шагу`);
                    console.log(`${COLORS.CYAN}[3]${COLORS.RESET} Отменить и выйти`);
                    
                    const choice = await readLine(`${COLORS.CYAN}Ваш выбор: ${COLORS.RESET}`);
                    
                    switch(choice.trim()) {
                        case '1':
                            break;
                        case '2':
                            currentStep = Math.max(0, currentStep - 1);
                            if (step.fields) {
                                step.fields.forEach(field => {
                                    delete results[field.name];
                                });
                            }
                            break;
                        case '3':
                            return {
                                data: results,
                                completed: false,
                                cancelled: true
                            };
                        default:
                            break;
                    }
                } else {
                    console.log(`${COLORS.YELLOW}⏎ Нажмите Enter для повтора...${COLORS.RESET}`);
                    await readLine('');
                }
            }
        }
        
        return {
            data: results,
            completed: currentStep >= steps.length,
            cancelled: false
        };
    }
    
    return processSteps();
}

function createSurveyForm(questions, options = {}) {
    const {
        title = 'Опрос',
        allowSkip = true,
        randomizeOrder = false,
        showQuestionNumbers = true
    } = options;
    
    if (randomizeOrder) {
        questions = questions.sort(() => Math.random() - 0.5);
    }
    
    const fields = questions.map((q, index) => ({
        name: q.id || `question_${index + 1}`,
        label: showQuestionNumbers ? 
            `[${index + 1}/${questions.length}] ${q.question}` : 
            q.question,
        type: q.type || 'text',
        required: !allowSkip && q.required !== false,
        choices: q.options,
        validation: q.validation || [],
        ...q
    }));
    
    return createForm(fields, { title, ...options });
}

function createRegistrationForm(options = {}) {
    const {
        requireEmail = true,
        requirePhone = false,
        requirePasswordConfirm = true,
        customFields = []
    } = options;
    
    const fields = [
        {
            name: 'username',
            label: 'Имя пользователя',
            type: 'text',
            validation: [
                (value) => validateRange(value, 3, 20, 'string')
            ]
        },
        {
            name: 'email',
            label: 'Email',
            type: 'text',
            required: requireEmail,
            validation: requireEmail ? [
                (value) => validateEmail(value) ? 
                    { isValid: true, errors: [] } : 
                    { isValid: false, errors: ['Неверный формат email'] }
            ] : []
        },
        {
            name: 'password',
            label: 'Пароль',
            type: 'password',
            validation: [
                (value) => validateRange(value, 8, 50, 'string')
            ]
        }
    ];
    
    if (requirePasswordConfirm) {
        fields.push({
            name: 'confirmPassword',
            label: 'Подтвердите пароль',
            type: 'password',
            dependsOn: 'password',
            validation: [
                (value, data) => {
                    if (value !== data.password) {
                        return { isValid: false, errors: ['Пароли не совпадают'] };
                    }
                    return { isValid: true, errors: [] };
                }
            ]
        });
    }
    
    if (requirePhone) {
        fields.push({
            name: 'phone',
            label: 'Телефон',
            type: 'text',
            validation: [
                (value) => validateRange(value, 10, 15, 'string')
            ]
        });
    }
    
    fields.push(...customFields);
    
    return createForm(fields, {
        title: 'Регистрация нового пользователя',
        ...options
    });
}

function createConfigForm(configSchema, options = {}) {
    const fields = Object.entries(configSchema).map(([key, config]) => ({
        name: key,
        label: config.description || key,
        type: config.type || 'text',
        defaultValue: config.default,
        required: config.required !== false,
        choices: config.enum,
        validation: config.validation || [],
        conditional: config.condition
    }));
    
    return createForm(fields, {
        title: 'Конфигурация приложения',
        ...options
    });
}

function createLoginForm(options = {}) {
    const {
        title = 'Вход в систему',
        allowRememberMe = true,
        customFields = []
    } = options;
    
    const fields = [
        {
            name: 'username',
            label: 'Логин или Email',
            type: 'text',
            required: true
        },
        {
            name: 'password',
            label: 'Пароль',
            type: 'password',
            required: true
        }
    ];
    
    if (allowRememberMe) {
        fields.push({
            name: 'rememberMe',
            label: 'Запомнить меня',
            type: 'boolean',
            required: false,
            defaultValue: false
        });
    }
    
    fields.push(...customFields);
    
    return createForm(fields, { title, ...options });
}

function createQuickForm(fieldDefinitions) {
    const fields = fieldDefinitions.map((def, index) => {
        if (typeof def === 'string') {
            return {
                name: `field_${index}`,
                label: def,
                type: 'text'
            };
        }
        return def;
    });
    
    return createForm(fields, {
        title: 'Быстрая форма',
        showProgress: false
    });
}

module.exports = {
    createForm,
    processField,
    createMultiStepForm,
    createSurveyForm,
    createRegistrationForm,
    createConfigForm,
    createLoginForm,
    createQuickForm
};
