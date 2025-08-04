module.exports = {
    ...require('./core/colors'),
    ...require('./core/renderer'),
    ...require('./core/terminal'),

    ...(() => {
        const boxes = require('./components/boxes');
        return boxes;
    })(),
    ...require('./components/forms'),
    ...require('./components/layouts'),
    ...require('./components/menu'),
    ...require('./components/progress'),

    ...require('./utils/input'),
    ...require('./utils/text'),
    ...require('./utils/validation'),
    
    ...require('./strings/formatters'),
    ...require('./themes'),
};