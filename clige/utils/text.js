const { stripAnsi } = require('../core/renderer');

function truncateText(text, maxLength, suffix = '...') {
    const cleanText = stripAnsi(text);
    if (cleanText.length <= maxLength) return text;
    
    const truncated = cleanText.substring(0, maxLength - suffix.length);
    return truncated + suffix;
}

function wrapWords(text, width, options = {}) {
    const { preserveIndent = false, breakLongWords = true } = options;
    
    const lines = text.split('\n');
    const wrappedLines = [];
    
    lines.forEach(line => {
        const cleanLine = stripAnsi(line);
        let indent = '';
        
        if (preserveIndent) {
            const match = cleanLine.match(/^(\s*)/);
            indent = match ? match[1] : '';
        }
        
        const words = cleanLine.trim().split(/\s+/);
        let currentLine = indent;
        
        words.forEach(word => {
            const testLine = currentLine === indent ? 
                currentLine + word : 
                currentLine + ' ' + word;
            
            if (stripAnsi(testLine).length <= width) {
                currentLine = testLine;
            } else {
                if (currentLine !== indent) {
                    wrappedLines.push(currentLine);
                    currentLine = indent + word;
                } else if (breakLongWords && word.length > width - indent.length) {
                    while (word.length > 0) {
                        const chunkSize = width - indent.length;
                        wrappedLines.push(indent + word.substring(0, chunkSize));
                        word = word.substring(chunkSize);
                    }
                    currentLine = indent;
                } else {
                    currentLine = indent + word;
                }
            }
        });
        
        if (currentLine !== indent) {
            wrappedLines.push(currentLine);
        }
    });
    
    return wrappedLines.join('\n');
}

function padText(text, width, char = ' ', align = 'left') {
    const cleanText = stripAnsi(text);
    const padding = Math.max(0, width - cleanText.length);
    
    switch (align) {
        case 'center':
            const leftPad = Math.floor(padding / 2);
            const rightPad = padding - leftPad;
            return char.repeat(leftPad) + text + char.repeat(rightPad);
        case 'right':
            return char.repeat(padding) + text;
        default:
            return text + char.repeat(padding);
    }
}

function extractWords(text, minLength = 3) {
    const cleanText = stripAnsi(text);
    const words = cleanText.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length >= minLength);
    
    return [...new Set(words)];
}

function highlightText(text, searchTerm, options = {}) {
    const {
        highlightColor = '\x1b[43m\x1b[30m',
        caseSensitive = false,
        wholeWord = false
    } = options;
    
    if (!searchTerm) return text;
    
    let pattern = caseSensitive ? searchTerm : searchTerm.toLowerCase();
    let targetText = caseSensitive ? text : text.toLowerCase();
    
    if (wholeWord) {
        pattern = `\\b${pattern}\\b`;
    }
    
    const regex = new RegExp(`(${pattern})`, caseSensitive ? 'g' : 'gi');
    
    return text.replace(regex, `${highlightColor}$1\x1b[0m`);
}

function countWords(text) {
    const cleanText = stripAnsi(text);
    const words = cleanText.trim().split(/\s+/).filter(word => word.length > 0);
    return words.length;
}

function countCharacters(text, includeSpaces = true) {
    const cleanText = stripAnsi(text);
    return includeSpaces ? cleanText.length : cleanText.replace(/\s/g, '').length;
}

function generateSlug(text, options = {}) {
    const { maxLength = 50, separator = '-' } = options;
    
    const cleanText = stripAnsi(text);
    const slug = cleanText
        .toLowerCase()
        .replace(/[а-я]/g, char => {
            const map = {
                'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e',
                'ё': 'yo', 'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k',
                'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r',
                'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts',
                'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '',
                'э': 'e', 'ю': 'yu', 'я': 'ya'
            };
            return map[char] || char;
        })
        .replace(/[^a-z0-9\s]/g, '')
        .trim()
        .replace(/\s+/g, separator)
        .substring(0, maxLength)
        .replace(new RegExp(`${separator}+$`), '');
    
    return slug;
}

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
}

function parseTemplate(template, variables = {}) {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return variables[key] !== undefined ? variables[key] : match;
    });
}

function similarity(str1, str2) {
    const cleanStr1 = stripAnsi(str1).toLowerCase();
    const cleanStr2 = stripAnsi(str2).toLowerCase();
    
    if (cleanStr1 === cleanStr2) return 1;
    
    const longer = cleanStr1.length > cleanStr2.length ? cleanStr1 : cleanStr2;
    const shorter = cleanStr1.length > cleanStr2.length ? cleanStr2 : cleanStr1;
    
    if (longer.length === 0) return 1;
    
    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    
    return matrix[str2.length][str1.length];
}

function cleanText(text, options = {}) {
    const {
        removeAnsi = true,
        removeExtraSpaces = true,
        removeTabs = true,
        removeLineBreaks = false,
        trim = true
    } = options;
    
    let cleaned = text;
    
    if (removeAnsi) {
        cleaned = stripAnsi(cleaned);
    }
    
    if (removeTabs) {
        cleaned = cleaned.replace(/\t/g, ' ');
    }
    
    if (removeExtraSpaces) {
        cleaned = cleaned.replace(/[ ]+/g, ' ');
    }
    
    if (removeLineBreaks) {
        cleaned = cleaned.replace(/\n/g, ' ');
    }
    
    if (trim) {
        cleaned = cleaned.trim();
    }
    
    return cleaned;
}

function capitalizeWords(text, options = {}) {
    const { excludeWords = ['и', 'в', 'на', 'с', 'по', 'для', 'от', 'до'] } = options;
    
    return text.replace(/\b\w+/g, (word, index) => {
        if (index > 0 && excludeWords.includes(word.toLowerCase())) {
            return word.toLowerCase();
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });
}

module.exports = {
    truncateText,
    wrapWords,
    padText,
    extractWords,
    highlightText,
    countWords,
    countCharacters,
    generateSlug,
    formatBytes,
    formatDuration,
    parseTemplate,
    similarity,
    levenshteinDistance,
    cleanText,
    capitalizeWords
};
