const { drawBox } = require('./boxes');
const { COLORS } = require('../core/colors');
const { getTerminalSize, enableRawMode, disableRawMode } = require('../core/terminal');
const { padToScreen } = require('./layouts')

function createMenuOption(index, text, options = {}) {
    const {
        prefix = '',
        suffix = '',
        selected = false,
        disabled = false,
        color = '',
        selectedColor = COLORS.BRIGHT_GREEN,
        disabledColor = COLORS.DIM
    } = options;
    
    const number = `[${index}]`;
    const indicator = selected ? '►' : ' ';
    
    let optionColor = color;
    if (disabled) optionColor = disabledColor;
    else if (selected) optionColor = selectedColor;
    
    return `${optionColor}${indicator} ${number} ${prefix}${text}${suffix}${COLORS.RESET}`;
}

function drawMenu(items, options = {}) {
    const {
        title = '',
        selected = 0,
        showNumbers = true,
        showIndicators = true,
        numbersColor = COLORS.CYAN,
        selectedColor = COLORS.BRIGHT_GREEN,
        normalColor = '',
        disabledColor = COLORS.DIM,
        boxOptions = {}
    } = options;
    
    let menuContent = '';
    
    items.forEach((item, index) => {
        const isSelected = index === selected;
        const isDisabled = item.disabled || false;
        const itemText = typeof item === 'string' ? item : item.text;
        const itemPrefix = typeof item === 'object' ? item.prefix || '' : '';
        const itemSuffix = typeof item === 'object' ? item.suffix || '' : '';
        
        let line = '';
        
        if (showIndicators && isSelected) {
            line += COLORS.BRIGHT_GREEN + '► ' + COLORS.RESET;
        } else if (showIndicators) {
            line += '  ';
        }
        
        if (showNumbers) {
            line += numbersColor + `[${index + 1}]` + COLORS.RESET + ' ';
        }
        
        let textColor = normalColor;
        if (isDisabled) textColor = disabledColor;
        else if (isSelected) textColor = selectedColor;
        
        line += textColor + itemPrefix + itemText + itemSuffix + COLORS.RESET;
        
        if (index < items.length - 1) {
            line += '\n';
        }
        
        menuContent += line;
    });
    
    return drawBox(menuContent, {
        title,
        ...boxOptions
    });
}

function createInteractiveMenu(items, options = {}, banner = '') {
    const {
        title         = 'Выберите опцию:',
        exitKey       = 'q',
        enterKey      = '\r',
        onSelect      = null,
        allowEscape   = true,
        clearScreen   = true,
        center        = false,
        boxOptions    = {}
    } = options;
    
    return new Promise(resolve => {
        let selectedIndex = 0;
        while (selectedIndex < items.length && items[selectedIndex].disabled) {
            selectedIndex++;
        }
        
        function render() {
            if (clearScreen) console.clear();
            
            const menuText = drawMenu(items, {
                title,
                selected : selectedIndex,
                ...options,
                boxOptions
            });
            
            const instructions = allowEscape
                ? `\n${COLORS.DIM}Используйте стрелки для навигации, Enter для выбора, '${exitKey}' для выхода${COLORS.RESET}`
                : `\n${COLORS.DIM}Используйте стрелки для навигации, Enter для выбора${COLORS.RESET}`;
            
            const fullMenu = menuText + instructions;
            
            if (center) {
                const content = banner ? banner + '\n' + fullMenu : fullMenu;
                console.log(padToScreen(content, { horizontal: 'center', vertical: 'center' }));
            } else {
                if (banner) console.log(banner);
                console.log(fullMenu);
            }
        }
        
        function handleInput(key) {
            switch (key) {
                case '\u001b[A': {
                    let idx = selectedIndex;
                    while (idx > 0) {
                        idx--;
                        if (!items[idx].disabled) {
                            selectedIndex = idx;
                            break;
                        }
                    }
                    render();
                    break;
                }
                case '\u001b[B': {
                    let idx = selectedIndex;
                    while (idx < items.length - 1) {
                        idx++;
                        if (!items[idx].disabled) {
                            selectedIndex = idx;
                            break;
                        }
                    }
                    render();
                    break;
                }
                case enterKey:
                    if (!items[selectedIndex].disabled) {
                        disableRawMode();
                        process.stdin.removeListener('data', handleInput);
                        if (onSelect) onSelect(selectedIndex, items[selectedIndex]);
                        resolve({
                            index : selectedIndex,
                            item  : items[selectedIndex],
                            value : typeof items[selectedIndex] === 'string'
                                ? items[selectedIndex]
                                : items[selectedIndex].value || items[selectedIndex].text
                        });
                    }
                    break;
                case exitKey:
                    if (allowEscape) {
                        disableRawMode();
                        process.stdin.removeListener('data', handleInput);
                        resolve(null);
                    }
                    break;
                case '\u0003':
                    disableRawMode();
                    process.stdin.removeListener('data', handleInput);
                    process.exit(0);
                    break;
                default: {
                    const num = parseInt(key);
                    if (!isNaN(num) && num >= 1 && num <= items.length) {
                        const target = num - 1;
                        if (!items[target].disabled) {
                            selectedIndex = target;
                            disableRawMode();
                            process.stdin.removeListener('data', handleInput);
                            if (onSelect) onSelect(target, items[target]);
                            resolve({
                                index : target,
                                item  : items[target],
                                value : typeof items[target] === 'string'
                                    ? items[target]
                                    : items[target].value || items[target].text
                            });
                        }
                    }
                }
            }
        }
        
        enableRawMode();
        process.stdin.setEncoding('utf8');
        process.stdin.on('data', handleInput);
        render();
    });
}



function createSimplePrompt(items, options = {}) {
    const {
        title = 'Выберите опцию:',
        showInstructions = true
    } = options;
    
    return new Promise((resolve) => {
        const menu = drawMenu(items, { title, ...options });
        console.log(menu);
        
        if (showInstructions) {
            console.log(`\n${COLORS.DIM}Введите номер опции:${COLORS.RESET} `);
        }
        
        process.stdin.setEncoding('utf8');
        process.stdin.once('data', (input) => {
            const choice = parseInt(input.toString().trim());
            
            if (isNaN(choice) || choice < 1 || choice > items.length) {
                console.log(`${COLORS.RED}Неверный выбор. Попробуйте снова.${COLORS.RESET}`);
                resolve(createSimplePrompt(items, options));
                return;
            }
            
            const selectedIndex = choice - 1;
            const selectedItem = items[selectedIndex];
            
            if (selectedItem.disabled) {
                console.log(`${COLORS.RED}Эта опция недоступна. Выберите другую.${COLORS.RESET}`);
                resolve(createSimplePrompt(items, options));
                return;
            }
            
            resolve({
                index: selectedIndex,
                item: selectedItem,
                value: typeof selectedItem === 'string' ? selectedItem : selectedItem.value || selectedItem.text
            });
        });
    });
}

function createMultiPageMenu(allItems, options = {}) {
    const {
        itemsPerPage = 10,
        title = 'Меню',
        showPageInfo = true
    } = options;
    
    const totalPages = Math.ceil(allItems.length / itemsPerPage);
    let currentPage = 0;
    
    function getCurrentPageItems() {
        const start = currentPage * itemsPerPage;
        const end = start + itemsPerPage;
        const pageItems = allItems.slice(start, end);
        
        const navItems = [...pageItems];
        
        if (currentPage > 0) {
            navItems.push({ text: '← Предыдущая страница', value: 'prev', prefix: '  ' });
        }
        
        if (currentPage < totalPages - 1) {
            navItems.push({ text: '→ Следующая страница', value: 'next', prefix: '  ' });
        }
        
        navItems.push({ text: 'Выход', value: 'exit', prefix: '  ', suffix: ' 🚪' });
        
        return navItems;
    }
    
    async function showPage() {
        const pageItems = getCurrentPageItems();
        const pageTitle = showPageInfo ? `${title} (стр. ${currentPage + 1}/${totalPages})` : title;
        
        const result = await createInteractiveMenu(pageItems, {
            ...options,
            title: pageTitle,
            allowEscape: false
        });
        
        if (!result) return null;
        
        switch (result.value) {
            case 'prev':
                currentPage--;
                return showPage();
            case 'next':
                currentPage++;
                return showPage();
            case 'exit':
                return null;
            default:
                return {
                    ...result,
                    globalIndex: currentPage * itemsPerPage + result.index
                };
        }
    }
    
    return showPage();
}

module.exports = {
    createMenuOption,
    drawMenu,
    createInteractiveMenu,
    createSimplePrompt,
    createMultiPageMenu
};
