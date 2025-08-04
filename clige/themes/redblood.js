const { COLORS, rgb } = require('../core/colors');

const redbloodTheme = {
    name: 'redblood',
    description: 'Агрессивная красно-черная тема в стиле хакерских инструментов',
    
    colors: {
        primary: COLORS.RED,
        secondary: COLORS.BRIGHT_RED,
        success: COLORS.BRIGHT_GREEN,
        warning: COLORS.YELLOW,
        error: COLORS.BRIGHT_RED,
        info: COLORS.RED,
        
        text: COLORS.RED,
        textSecondary: COLORS.BRIGHT_RED,
        textMuted: COLORS.DIM + COLORS.RED,
        
        background: COLORS.BG_BLACK,
        backgroundSecondary: COLORS.BG_RED,
        
        border: COLORS.RED,
        borderActive: COLORS.BRIGHT_RED,
        borderSuccess: COLORS.BRIGHT_GREEN,
        borderError: COLORS.BRIGHT_RED,
        
        accent: rgb(255, 0, 80),
        highlight: COLORS.BG_RED + COLORS.BRIGHT_WHITE,
        
        blood: rgb(139, 0, 0),
        crimson: rgb(220, 20, 60),
        fire: rgb(255, 69, 0)
    },
    
    styles: {
        title: COLORS.BOLD + COLORS.BRIGHT_RED,
        subtitle: COLORS.BOLD + COLORS.RED,
        emphasis: COLORS.BOLD + COLORS.BRIGHT_RED,
        code: COLORS.BG_BLACK + COLORS.BRIGHT_RED,
        link: COLORS.UNDERLINE + COLORS.RED,
        quote: COLORS.ITALIC + COLORS.DIM + COLORS.RED,
        
        logo: COLORS.BOLD + COLORS.BRIGHT_RED,
        danger: COLORS.BOLD + COLORS.BRIGHT_RED + COLORS.BLINK,
        shadow: COLORS.DIM + COLORS.RED
    },
    
    components: {
        box: {
            borderStyle: 'double',
            padding: 1,
            titleColor: COLORS.BOLD + COLORS.BRIGHT_RED,
            contentColor: COLORS.RED
        },
        
        menu: {
            selectedColor: COLORS.BRIGHT_RED + COLORS.BOLD,
            normalColor: COLORS.RED,
            disabledColor: COLORS.DIM + COLORS.RED,
            numbersColor: COLORS.BRIGHT_RED,
            indicatorColor: rgb(255, 0, 80),
            fireEmoji: '🔥'
        },
        
        progress: {
            fillColor: COLORS.BRIGHT_RED,
            emptyColor: COLORS.DIM + COLORS.RED,
            textColor: COLORS.RED,
            fillChar: '█',
            emptyChar: '▓',
            dangerChar: '▰'
        },
        
        input: {
            promptColor: COLORS.BRIGHT_RED,
            inputColor: COLORS.RED,
            errorColor: COLORS.BRIGHT_RED + COLORS.BOLD,
            successColor: COLORS.BRIGHT_GREEN
        },
        
        table: {
            headerColor: COLORS.BOLD + COLORS.BRIGHT_RED,
            borderColor: COLORS.RED,
            cellColor: COLORS.RED,
            alternateColor: COLORS.DIM + COLORS.RED
        }
    },
    
    messages: {
        success: {
            prefix: '⚡',
            color: COLORS.BRIGHT_GREEN
        },
        error: {
            prefix: '💀',
            color: COLORS.BRIGHT_RED
        },
        warning: {
            prefix: '🔥',
            color: COLORS.YELLOW
        },
        info: {
            prefix: '🩸',
            color: COLORS.RED
        },
        attack: {
            prefix: '⚔️',
            color: COLORS.BRIGHT_RED + COLORS.BOLD
        },
        skull: {
            prefix: '☠️',
            color: COLORS.BRIGHT_RED
        }
    },
    
    ascii: {
        skull: `
    ☠️  ☠️  ☠️
   ☠️ 💀 ☠️
    ☠️  ☠️  ☠️`,
        
        fire: `🔥 🔥 🔥 🔥 🔥`,
        
        blood: `🩸 🩸 🩸 🩸 🩸`,
        
        separator: '━'.repeat(50)
    }
};

module.exports = { redbloodTheme };
