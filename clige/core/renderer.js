const { getTerminalSize } = require('./terminal');

function repeat(char, count) {
    return char.repeat(Math.max(0, count));
}

function pad(text, width, char = ' ', align = 'left') {
    const textLength = stripAnsi(text).length;
    const padding = Math.max(0, width - textLength);
    
    switch (align) {
        case 'center':
            const leftPad = Math.floor(padding / 2);
            const rightPad = padding - leftPad;
            return repeat(char, leftPad) + text + repeat(char, rightPad);
        case 'right':
            return repeat(char, padding) + text;
        default:
            return text + repeat(char, padding);
    }
}

function stripAnsi(text) {
    return text.replace(/\x1b\[[0-9;]*m/g, '');
}

function wrapText(text, width) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    
    for (const word of words) {
        const testLine = currentLine ? currentLine + ' ' + word : word;
        
        if (stripAnsi(testLine).length <= width) {
            currentLine = testLine;
        } else {
            if (currentLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                lines.push(word.substring(0, width));
                currentLine = word.substring(width);
            }
        }
    }
    
    if (currentLine) {
        lines.push(currentLine);
    }
    
    return lines;
}

function truncate(text, width, suffix = '...') {
    const cleanText = stripAnsi(text);
    if (cleanText.length <= width) return text;
    
    const truncated = cleanText.substring(0, width - suffix.length);
    return truncated + suffix;
}

function alignText(text, width, alignment = 'left') {
    const lines = text.split('\n');
    return lines.map(line => pad(line, width, ' ', alignment)).join('\n');
}

function createBorder(width, style = 'single') {
    const borders = {
        single: {
            topLeft: '┌',
            topRight: '┐',
            bottomLeft: '└',
            bottomRight: '┘',
            horizontal: '─',
            vertical: '│'
        },
        double: {
            topLeft: '╔',
            topRight: '╗',
            bottomLeft: '╚',
            bottomRight: '╝',
            horizontal: '═',
            vertical: '║'
        },
        rounded: {
            topLeft: '╭',
            topRight: '╮',
            bottomLeft: '╰',
            bottomRight: '╯',
            horizontal: '─',
            vertical: '│'
        },
        thick: {
            topLeft: '┏',
            topRight: '┓',
            bottomLeft: '┗',
            bottomRight: '┛',
            horizontal: '━',
            vertical: '┃'
        }
    };
    
    return borders[style] || borders.single;
}

function measureText(text) {
    const lines = text.split('\n');
    const cleanLines = lines.map(line => stripAnsi(line));
    
    return {
        width: Math.max(...cleanLines.map(line => line.length)),
        height: lines.length,
        lines: cleanLines
    };
}

function fitToTerminal(text, reservedWidth = 0, reservedHeight = 0) {
    const terminal = getTerminalSize();
    const maxWidth = terminal.width - reservedWidth;
    const maxHeight = terminal.height - reservedHeight;
    
    const lines = text.split('\n');
    const fittedLines = lines.slice(0, maxHeight);
    
    return fittedLines.map(line => truncate(line, maxWidth)).join('\n');
}

module.exports = {
    repeat,
    pad,
    stripAnsi,
    wrapText,
    truncate,
    alignText,
    createBorder,
    measureText,
    fitToTerminal
};
