function getTerminalSize() {
    return {
        width: process.stdout.columns || 80,
        height: process.stdout.rows || 24
    };
}

function clear() {
    console.clear();
}

function moveCursor(x, y) {
    process.stdout.write(`\x1b[${y};${x}H`);
}

function hideCursor() {
    process.stdout.write('\x1b[?25l');
}

function showCursor() {
    process.stdout.write('\x1b[?25h');
}

function clearLine() {
    process.stdout.write('\x1b[2K');
}

function clearFromCursor() {
    process.stdout.write('\x1b[0K');
}

function saveCursor() {
    process.stdout.write('\x1b[s');
}

function restoreCursor() {
    process.stdout.write('\x1b[u');
}

function scrollUp(lines = 1) {
    process.stdout.write(`\x1b[${lines}S`);
}

function scrollDown(lines = 1) {
    process.stdout.write(`\x1b[${lines}T`);
}

function bell() {
    process.stdout.write('\x07');
}

function enableRawMode() {
    if (process.stdin.isTTY) {
        process.stdin.setRawMode(true);
    }
}

function disableRawMode() {
    if (process.stdin.isTTY) {
        process.stdin.setRawMode(false);
    }
}

function onResize(callback) {
    process.stdout.on('resize', callback);
}

function getAvailableSpace(reservedLines = 0) {
    const size = getTerminalSize();
    return {
        width: size.width,
        height: size.height - reservedLines
    };
}

function isTerminalColorSupported() {
    return process.stdout.isTTY && (
        process.env.COLORTERM ||
        process.env.TERM === 'xterm-256color' ||
        process.env.TERM === 'screen-256color' ||
        process.env.TERM_PROGRAM === 'iTerm.app'
    );
}

module.exports = {
    getTerminalSize,
    clear,
    moveCursor,
    hideCursor,
    showCursor,
    clearLine,
    clearFromCursor,
    saveCursor,
    restoreCursor,
    scrollUp,
    scrollDown,
    bell,
    enableRawMode,
    disableRawMode,
    onResize,
    getAvailableSpace,
    isTerminalColorSupported
};
