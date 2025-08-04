const { COLORS } = require('../core/colors');

const darkTheme = {
    name: 'dark',
    description: 'Темная тема для ночной работы',
    
    colors: {
        primary: COLORS.BRIGHT_BLUE,
        secondary: COLORS.BRIGHT_CYAN,
        success: COLORS.BRIGHT_GREEN,
        warning: COLORS.BRIGHT_YELLOW,
        error: COLORS.BRIGHT_RED,
        info: COLORS.BRIGHT_CYAN,
        
        text: COLORS.BRIGHT_WHITE,
        textSecondary: COLORS.WHITE,
        textMuted: COLORS.DIM,
        
        background: COLORS.BG_BLACK,
        backgroundSecondary: COLORS.BG_BRIGHT_BLACK,
        
        border: COLORS.BRIGHT_BLACK,
        borderActive: COLORS.BRIGHT_BLUE,
        borderSuccess: COLORS.BRIGHT_GREEN,
        borderError: COLORS.BRIGHT_RED,
        
        accent: COLORS.BRIGHT_MAGENTA,
        highlight: COLORS.BG_YELLOW + COLORS.BLACK
    },
    
    styles: {
        title: COLORS.BOLD + COLORS.BRIGHT_WHITE,
        subtitle: COLORS.BOLD + COLORS.BRIGHT_CYAN,
        emphasis: COLORS.BOLD + COLORS.BRIGHT_WHITE,
        code: COLORS.BG_BRIGHT_BLACK + COLORS.BRIGHT_GREEN,
        link: COLORS.UNDERLINE + COLORS.BRIGHT_BLUE,
        quote: COLORS.ITALIC + COLORS.BRIGHT_BLACK
    },
    
    components: {
        box: {
            borderStyle: 'single',
            padding: 1,
            titleColor: COLORS.BOLD + COLORS.BRIGHT_WHITE,
            contentColor: COLORS.BRIGHT_WHITE
        },
        
        menu: {
            selectedColor: COLORS.BRIGHT_GREEN + COLORS.BOLD,
            normalColor: COLORS.BRIGHT_WHITE,
            disabledColor: COLORS.DIM,
            numbersColor: COLORS.BRIGHT_CYAN,
            indicatorColor: COLORS.BRIGHT_GREEN
        },
        
        progress: {
            fillColor: COLORS.BRIGHT_GREEN,
            emptyColor: COLORS.BRIGHT_BLACK,
            textColor: COLORS.BRIGHT_WHITE,
            fillChar: '█',
            emptyChar: '▒'
        },
        
        input: {
            promptColor: COLORS.BRIGHT_CYAN,
            inputColor: COLORS.BRIGHT_WHITE,
            errorColor: COLORS.BRIGHT_RED,
            successColor: COLORS.BRIGHT_GREEN
        },
        
        table: {
            headerColor: COLORS.BOLD + COLORS.BRIGHT_WHITE,
            borderColor: COLORS.BRIGHT_BLACK,
            cellColor: COLORS.BRIGHT_WHITE,
            alternateColor: COLORS.WHITE
        }
    },
    
    messages: {
        success: {
            prefix: '✓',
            color: COLORS.BRIGHT_GREEN
        },
        error: {
            prefix: '✗',
            color: COLORS.BRIGHT_RED
        },
        warning: {
            prefix: '⚠',
            color: COLORS.BRIGHT_YELLOW
        },
        info: {
            prefix: 'ℹ',
            color: COLORS.BRIGHT_CYAN
        }
    }
};

module.exports = { darkTheme };
