const { repeat } = require('../core/renderer');
const { COLORS } = require('../core/colors');
const { getTerminalSize } = require('../core/terminal');

function drawProgressBar(current, total, options = {}) {
    const {
        width = 40,
        fillChar = '█',
        emptyChar = '░',
        showPercentage = true,
        showNumbers = true,
        color = COLORS.GREEN,
        backgroundColor = COLORS.DIM,
        brackets = ['[', ']']
    } = options;
    
    const percentage = Math.min(100, Math.max(0, (current / total) * 100));
    const filled = Math.floor((percentage / 100) * width);
    const empty = width - filled;
    
    let bar = brackets[0];
    bar += color + repeat(fillChar, filled) + COLORS.RESET;
    bar += backgroundColor + repeat(emptyChar, empty) + COLORS.RESET;
    bar += brackets[1];
    
    if (showPercentage) {
        bar += ` ${percentage.toFixed(1)}%`;
    }
    
    if (showNumbers) {
        bar += ` (${current}/${total})`;
    }
    
    return bar;
}

function drawSpinner(frame = 0, options = {}) {
    const {
        style = 'dots',
        color = COLORS.CYAN,
        text = ''
    } = options;
    
    const styles = {
        dots: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
        line: ['|', '/', '-', '\\'],
        arrow: ['↑', '↗', '→', '↘', '↓', '↙', '←', '↖'],
        bounce: ['⠁', '⠂', '⠄', '⠂'],
        pulse: ['●', '◐', '◑', '◒', '◓', '◔', '◕', '◖', '◗', '◘']
    };
    
    const frames = styles[style] || styles.dots;
    const currentFrame = frames[frame % frames.length];
    
    return color + currentFrame + COLORS.RESET + (text ? ' ' + text : '');
}

function drawMultiProgressBar(bars, options = {}) {
    const {
        title = '',
        showTotal = true,
        spacing = 1,
        maxWidth
    } = options;
    
    const terminal = getTerminalSize();
    const availableWidth = maxWidth || terminal.width - 4;
    
    let result = '';
    
    if (title) {
        result += COLORS.BOLD + title + COLORS.RESET + '\n';
        if (spacing > 0) result += '\n'.repeat(spacing);
    }
    
    let totalCurrent = 0;
    let totalMax = 0;
    
    bars.forEach((bar, index) => {
        const label = bar.label || `Задача ${index + 1}`;
        const current = bar.current || 0;
        const total = bar.total || 100;
        const color = bar.color || COLORS.GREEN;
        
        totalCurrent += current;
        totalMax += total;
        
        const labelWidth = 20;
        const barWidth = availableWidth - labelWidth - 15;
        
        const paddedLabel = label.padEnd(labelWidth, ' ').substring(0, labelWidth);
        const progressBar = drawProgressBar(current, total, {
            width: barWidth,
            color,
            showNumbers: false
        });
        
        const percentage = ((current / total) * 100).toFixed(1).padStart(5, ' ');
        
        result += paddedLabel + ' ' + progressBar + ' ' + percentage + '%';
        
        if (index < bars.length - 1) {
            result += '\n';
        }
    });
    
    if (showTotal && bars.length > 1) {
        result += '\n' + '─'.repeat(availableWidth) + '\n';
        result += 'ОБЩИЙ ПРОГРЕСС'.padEnd(21, ' ');
        result += drawProgressBar(totalCurrent, totalMax, {
            width: availableWidth - 35,
            color: COLORS.BRIGHT_GREEN
        });
    }
    
    return result;
}

function drawLoadingAnimation(frame = 0, options = {}) {
    const {
        text = 'Загрузка',
        dotCount = 3,
        color = COLORS.YELLOW,
        maxDots = 6
    } = options;
    
    const dots = repeat('.', (frame % (maxDots + 1)));
    const spaces = repeat(' ', maxDots - dots.length);
    
    return color + text + dots + spaces + COLORS.RESET;
}

function createAnimatedProgress(total, options = {}) {
    const {
        updateInterval = 100,
        onUpdate,
        onComplete,
        autoComplete = true
    } = options;
    
    let current = 0;
    let isActive = false;
    let intervalId;
    
    const controller = {
        start() {
            if (isActive) return;
            isActive = true;
            
            intervalId = setInterval(() => {
                if (onUpdate) {
                    onUpdate(current, total);
                }
                
                if (autoComplete) {
                    current++;
                    if (current >= total) {
                        this.stop();
                        if (onComplete) onComplete();
                    }
                }
            }, updateInterval);
        },
        
        stop() {
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
            }
            isActive = false;
        },
        
        update(value) {
            current = Math.min(total, Math.max(0, value));
            if (current >= total && onComplete) {
                this.stop();
                onComplete();
            }
        },
        
        increment(step = 1) {
            this.update(current + step);
        },
        
        getCurrent() {
            return current;
        },
        
        getTotal() {
            return total;
        },
        
        isRunning() {
            return isActive;
        }
    };
    
    return controller;
}

function drawStepProgress(steps, currentStep = 0, options = {}) {
    const {
        completedChar = '✓',
        currentChar = '●',
        pendingChar = '○',
        connector = '─',
        completedColor = COLORS.GREEN,
        currentColor = COLORS.YELLOW,
        pendingColor = COLORS.DIM,
        showLabels = true,
        vertical = false
    } = options;
    
    if (vertical) {
        let result = '';
        steps.forEach((step, index) => {
            let char, color;
            
            if (index < currentStep) {
                char = completedChar;
                color = completedColor;
            } else if (index === currentStep) {
                char = currentChar;
                color = currentColor;
            } else {
                char = pendingChar;
                color = pendingColor;
            }
            
            result += color + char + COLORS.RESET;
            if (showLabels) {
                result += ' ' + step;
            }
            
            if (index < steps.length - 1) {
                result += '\n';
                if (!showLabels) {
                    result += color + '│' + COLORS.RESET + '\n';
                }
            }
        });
        return result;
    }
    
    let result = '';
    steps.forEach((step, index) => {
        let char, color;
        
        if (index < currentStep) {
            char = completedChar;
            color = completedColor;
        } else if (index === currentStep) {
            char = currentChar;
            color = currentColor;
        } else {
            char = pendingChar;
            color = pendingColor;
        }
        
        result += color + char + COLORS.RESET;
        
        if (index < steps.length - 1) {
            result += repeat(connector, 2);
        }
    });
    
    if (showLabels) {
        result += '\n';
        steps.forEach((step, index) => {
            const stepText = step.substring(0, 10);
            result += stepText.padEnd(12, ' ');
        });
        result = result.trim();
    }
    
    return result;
}

module.exports = {
    drawProgressBar,
    drawSpinner,
    drawMultiProgressBar,
    drawLoadingAnimation,
    createAnimatedProgress,
    drawStepProgress
};
