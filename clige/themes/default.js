const { COLORS } = require('../core/colors');

const defaultTheme = {
    name: 'default',
    description: 'Стандартная светлая тема',
    
    colors: {
        primary: COLORS.BLUE,
        secondary: COLORS.CYAN,
        success: COLORS.GREEN,
        warning: COLORS.YELLOW,
        error: COLORS.RED,
        info: COLORS.CYAN,
        
        text: COLORS.WHITE,
        textSecondary: COLORS.DIM,
        textMuted: COLORS.BRIGHT_BLACK,
        
        background: '',
        backgroundSecondary: COLORS.BG_BLACK,
        
        border: COLORS.WHITE,
        borderActive: COLORS.BRIGHT_BLUE,
        borderSuccess: COLORS.BRIGHT_GREEN,
        borderError: COLORS.BRIGHT_RED,
        
        accent: COLORS.BRIGHT_CYAN,
        highlight: COLORS.BRIGHT_YELLOW
    },
    
    styles: {
        title: COLORS.BOLD + COLORS.BRIGHT_WHITE,
        subtitle: COLORS.BOLD + COLORS.CYAN,
        emphasis: COLORS.BOLD,
        code: COLORS.BG_BLACK + COLORS.BRIGHT_GREEN,
        link: COLORS.UNDERLINE + COLORS.BLUE,
        quote: COLORS.ITALIC + COLORS.DIM
    },
    
    components: {
        box: {
            borderStyle: 'single',
            padding: 1,
            titleColor: COLORS.BOLD + COLORS.WHITE,
            contentColor: COLORS.WHITE
        },
        
        menu: {
            selectedColor: COLORS.BRIGHT_GREEN + COLORS.BOLD,
            normalColor: COLORS.WHITE,
            disabledColor: COLORS.DIM,
            numbersColor: COLORS.CYAN,
            indicatorColor: COLORS.BRIGHT_GREEN
        },
        
        progress: {
            fillColor: COLORS.GREEN,
            emptyColor: COLORS.DIM,
            textColor: COLORS.WHITE,
            fillChar: '█',
            emptyChar: '░'
        },
        
        input: {
            promptColor: COLORS.CYAN,
            inputColor: COLORS.WHITE,
            errorColor: COLORS.RED,
            successColor: COLORS.GREEN
        },
        
        table: {
            headerColor: COLORS.BOLD + COLORS.WHITE,
            borderColor: COLORS.DIM,
            cellColor: COLORS.WHITE,
            alternateColor: COLORS.DIM
        }
    },
    
    messages: {
        success: {
            prefix: '✓',
            color: COLORS.GREEN
        },
        error: {
            prefix: '✗',
            color: COLORS.RED
        },
        warning: {
            prefix: '⚠',
            color: COLORS.YELLOW
        },
        info: {
            prefix: 'ℹ',
            color: COLORS.CYAN
        }
    }
};

function applyTheme(source = defaultTheme) {
    const wrapper = {};

    wrapper.get = (path = '') => {
        const keys = path.split('.');
        let val = source;
        for (const k of keys) {
            val = val?.[k];
            if (val === undefined) return '';
        }
        return val;
    };

    wrapper.colorize = (text, colorPath) => {
        const code = wrapper.get(colorPath) || '';
        return code + text + COLORS.RESET;
    };

    wrapper.style = (text, stylePath) => {
        const code = wrapper.get(`styles.${stylePath}`) || '';
        return code + text + COLORS.RESET;
    };

    return wrapper;
}


module.exports = {
    defaultTheme,
    applyTheme
};
