const { getTerminalSize } = require('../core/terminal');
const { stripAnsi, pad, repeat, measureText } = require('../core/renderer');
const { COLORS } = require('../core/colors');

function centerText(text, options = {}) {
    const { width, color = '', padChar = ' ' } = options;
    const terminal = getTerminalSize();
    const targetWidth = width || terminal.width;
    
    const lines = text.split('\n');
    return lines.map(line => {
        const cleanLine = stripAnsi(line);
        const padding = Math.max(0, Math.floor((targetWidth - cleanLine.length) / 2));
        return repeat(padChar, padding) + color + line + COLORS.RESET;
    }).join('\n');
}

function alignText(text, alignment = 'left', options = {}) {
    const { width, padChar = ' ' } = options;
    const terminal = getTerminalSize();
    const targetWidth = width || terminal.width;
    
    const lines = text.split('\n');
    return lines.map(line => {
        switch (alignment) {
            case 'center':
                return centerText(line, { width: targetWidth, padChar });
            case 'right':
                const cleanLine = stripAnsi(line);
                const padding = Math.max(0, targetWidth - cleanLine.length);
                return repeat(padChar, padding) + line;
            default:
                return pad(line, targetWidth, padChar, 'left');
        }
    }).join('\n');
}

function createColumns(contents, options = {}) {
    const {
        widths = [],
        spacing = 2,
        alignment = [],
        borders = false,
        borderChar = '│'
    } = options;
    
    const terminal = getTerminalSize();
    const totalSpacing = (contents.length - 1) * spacing;
    const availableWidth = terminal.width - totalSpacing;
    
    let columnWidths;
    if (widths.length === contents.length) {
        columnWidths = widths;
    } else {
        const evenWidth = Math.floor(availableWidth / contents.length);
        columnWidths = contents.map(() => evenWidth);
    }
    
    const columnContents = contents.map((content, index) => {
        const lines = content.split('\n');
        const width = columnWidths[index];
        const align = alignment[index] || 'left';
        
        return lines.map(line => {
            const cleanLine = stripAnsi(line);
            if (cleanLine.length > width) {
                return line.substring(0, width - 3) + '...';
            }
            return pad(line, width, ' ', align);
        });
    });
    
    const maxLines = Math.max(...columnContents.map(col => col.length));
    
    let result = '';
    for (let i = 0; i < maxLines; i++) {
        let line = '';
        
        columnContents.forEach((column, colIndex) => {
            const cellContent = column[i] || repeat(' ', columnWidths[colIndex]);
            line += cellContent;
            
            if (colIndex < columnContents.length - 1) {
                if (borders) {
                    line += ` ${borderChar} `;
                } else {
                    line += repeat(' ', spacing);
                }
            }
        });
        
        result += line;
        if (i < maxLines - 1) result += '\n';
    }
    
    return result;
}

function createGrid(items, options = {}) {
    const {
        columns = 3,
        cellWidth = 20,
        cellHeight = 5,
        spacing = 1,
        showBorders = false,
        alignment = 'center'
    } = options;
    
    const rows = Math.ceil(items.length / columns);
    let result = '';
    
    for (let row = 0; row < rows; row++) {
        const rowItems = [];
        
        for (let col = 0; col < columns; col++) {
            const itemIndex = row * columns + col;
            const item = items[itemIndex];
            
            if (item) {
                const lines = item.split('\n');
                const paddedLines = [];
                
                for (let i = 0; i < cellHeight; i++) {
                    const line = lines[i] || '';
                    paddedLines.push(pad(line, cellWidth, ' ', alignment));
                }
                
                rowItems.push(paddedLines.join('\n'));
            } else {
                rowItems.push(repeat(' ', cellWidth));
            }
        }
        
        if (showBorders) {
            const borderLine = rowItems.map(() => repeat('─', cellWidth)).join('┼');
            if (row > 0) result += borderLine + '\n';
        }
        
        const gridRow = createColumns(rowItems, {
            widths: rowItems.map(() => cellWidth),
            spacing,
            borders: showBorders,
            borderChar: '│'
        });
        
        result += gridRow;
        if (row < rows - 1) result += '\n'.repeat(spacing + 1);
    }
    
    return result;
}

function padToScreen(content, options = {}) {
    const {
        horizontal = 'center',
        vertical = 'center',
        fillChar = ' ',
        reservedLines = 0
    } = options;
    
    const terminal = getTerminalSize();
    const availableHeight = terminal.height - reservedLines;
    
    const lines = content.split('\n');
    const contentHeight = lines.length;
    
    let result = content;
    
    if (horizontal !== 'left') {
        result = alignText(result, horizontal, { padChar: fillChar });
    }
    
    if (vertical === 'center') {
        const topPadding = Math.max(0, Math.floor((availableHeight - contentHeight) / 2));
        result = repeat('\n', topPadding) + result;
    } else if (vertical === 'bottom') {
        const topPadding = Math.max(0, availableHeight - contentHeight);
        result = repeat('\n', topPadding) + result;
    }
    
    return result;
}

function createBanner(text, options = {}) {
    const {
        style = 'simple',
        width,
        padding = 1,
        color = COLORS.BOLD,
        borderColor = '',
        fillChar = ' '
    } = options;
    
    const terminal = getTerminalSize();
    const bannerWidth = width || Math.min(terminal.width - 4, 60);
    
    const styles = {
        simple: {
            top: repeat('═', bannerWidth),
            middle: (text) => `║${repeat(fillChar, padding)}${centerText(text, { width: bannerWidth - 2 - padding * 2 })}${repeat(fillChar, padding)}║`,
            bottom: repeat('═', bannerWidth)
        },
        double: {
            top: repeat('╔', 1) + repeat('═', bannerWidth - 2) + repeat('╗', 1),
            middle: (text) => `║${repeat(fillChar, padding)}${centerText(text, { width: bannerWidth - 2 - padding * 2 })}${repeat(fillChar, padding)}║`,
            bottom: repeat('╚', 1) + repeat('═', bannerWidth - 2) + repeat('╝', 1)
        },
        star: {
            top: repeat('*', bannerWidth),
            middle: (text) => `*${repeat(fillChar, padding)}${centerText(text, { width: bannerWidth - 2 - padding * 2 })}${repeat(fillChar, padding)}*`,
            bottom: repeat('*', bannerWidth)
        }
    };
    
    const selectedStyle = styles[style] || styles.simple;
    
    let result = borderColor + selectedStyle.top + COLORS.RESET + '\n';
    
    const textLines = text.split('\n');
    textLines.forEach(line => {
        result += borderColor + selectedStyle.middle(color + line + COLORS.RESET) + COLORS.RESET + '\n';
    });
    
    result += borderColor + selectedStyle.bottom + COLORS.RESET;
    
    return result;
}

function createTable(data, options = {}) {
    const {
        headers = [],
        columnWidths = [],
        showHeaders = true,
        showBorders = true,
        alignment = [],
        headerColor = COLORS.BOLD,
        borderColor = COLORS.DIM
    } = options;
    
    if (!data.length) return '';
    
    const columns = Math.max(headers.length, Math.max(...data.map(row => row.length)));
    
    let widths;
    if (columnWidths.length === columns) {
        widths = columnWidths;
    } else {
        widths = [];
        for (let col = 0; col < columns; col++) {
            const headerWidth = headers[col] ? stripAnsi(headers[col]).length : 0;
            const dataWidth = Math.max(...data.map(row => {
                const cell = row[col] || '';
                return stripAnsi(cell.toString()).length;
            }));
            widths.push(Math.max(headerWidth, dataWidth) + 2);
        }
    }
    
    let result = '';
    
    if (showBorders) {
        const topBorder = '┌' + widths.map(w => repeat('─', w)).join('┬') + '┐';
        result += borderColor + topBorder + COLORS.RESET + '\n';
    }
    
    if (showHeaders && headers.length) {
        let headerRow = showBorders ? '│' : '';
        headers.forEach((header, index) => {
            const width = widths[index];
            const align = alignment[index] || 'left';
            const paddedHeader = pad(headerColor + header + COLORS.RESET, width, ' ', align);
            headerRow += paddedHeader;
            if (showBorders) headerRow += borderColor + '│' + COLORS.RESET;
        });
        result += headerRow + '\n';
        
        if (showBorders) {
            const separator = '├' + widths.map(w => repeat('─', w)).join('┼') + '┤';
            result += borderColor + separator + COLORS.RESET + '\n';
        }
    }
    
    data.forEach((row, rowIndex) => {
        let dataRow = showBorders ? borderColor + '│' + COLORS.RESET : '';
        for (let col = 0; col < columns; col++) {
            const cell = row[col] || '';
            const width = widths[col];
            const align = alignment[col] || 'left';
            const paddedCell = pad(cell.toString(), width, ' ', align);
            dataRow += paddedCell;
            if (showBorders) dataRow += borderColor + '│' + COLORS.RESET;
        }
        result += dataRow;
        if (rowIndex < data.length - 1) result += '\n';
    });
    
    if (showBorders) {
        result += '\n';
        const bottomBorder = '└' + widths.map(w => repeat('─', w)).join('┴') + '┘';
        result += borderColor + bottomBorder + COLORS.RESET;
    }
    
    return result;
}

module.exports = {
    centerText,
    alignText,
    createColumns,
    createGrid,
    padToScreen,
    createBanner,
    createTable
};
