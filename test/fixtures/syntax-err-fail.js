'use strict';

const planify = require('../../');

function build(options) {
    return planify(options)
    .step('Step', () => {
        console.log('step.visit');

        throw new SyntaxError('There\'s a syntax error in your code');
    });
}

module.exports = build;
