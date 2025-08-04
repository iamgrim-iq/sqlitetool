const COLORS = {
    BLACK: '\x1b[30m',
    RED: '\x1b[31m',
    GREEN: '\x1b[32m',
    YELLOW: '\x1b[33m',
    BLUE: '\x1b[34m',
    MAGENTA: '\x1b[35m',
    CYAN: '\x1b[36m',
    WHITE: '\x1b[37m',
    
    BRIGHT_BLACK: '\x1b[90m',
    BRIGHT_RED: '\x1b[91m',
    BRIGHT_GREEN: '\x1b[92m',
    BRIGHT_YELLOW: '\x1b[93m',
    BRIGHT_BLUE: '\x1b[94m',
    BRIGHT_MAGENTA: '\x1b[95m',
    BRIGHT_CYAN: '\x1b[96m',
    BRIGHT_WHITE: '\x1b[97m',
    
    BG_BLACK: '\x1b[40m',
    BG_RED: '\x1b[41m',
    BG_GREEN: '\x1b[42m',
    BG_YELLOW: '\x1b[43m',
    BG_BLUE: '\x1b[44m',
    BG_MAGENTA: '\x1b[45m',
    BG_CYAN: '\x1b[46m',
    BG_WHITE: '\x1b[47m',
    
    RESET: '\x1b[0m',
    BOLD: '\x1b[1m',
    DIM: '\x1b[2m',
    ITALIC: '\x1b[3m',
    UNDERLINE: '\x1b[4m',
    BLINK: '\x1b[5m',
    REVERSE: '\x1b[7m',
    STRIKETHROUGH: '\x1b[9m'
};

function colorize(text, color) {
    return color + text + COLORS.RESET;
}

function style(text, ...styles) {
    const prefix = styles.join('');
    return prefix + text + COLORS.RESET;
}

function rgb(r, g, b) {
    return `\x1b[38;2;${r};${g};${b}m`;
}

function bgRgb(r, g, b) {
    return `\x1b[48;2;${r};${g};${b}m`;
}

function gradient(text, startColor, endColor) {
    const chars = text.split('');
    const length = chars.length;
    let result = '';
    
    for (let i = 0; i < length; i++) {
        const ratio = i / (length - 1);
        const r = Math.round(startColor.r + (endColor.r - startColor.r) * ratio);
        const g = Math.round(startColor.g + (endColor.g - startColor.g) * ratio);
        const b = Math.round(startColor.b + (endColor.b - startColor.b) * ratio);
        
        result += rgb(r, g, b) + chars[i] + COLORS.RESET;
    }
    
    return result;
}

module.exports = {
    COLORS,
    colorize,
    style,
    rgb,
    bgRgb,
    gradient
};
