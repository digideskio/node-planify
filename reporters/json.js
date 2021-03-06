'use strict';

const pick = require('lodash/pick');
const omit = require('lodash/omit');
const indentString = require('indent-string');
const serializeError = require('serialize-error');

function fillReferences(refs, node) {
    let ref;

    do {
        ref = (Math.random() * Math.pow(10, 20)).toString(36);
    } while (refs[ref]);

    node.ref = ref;
    refs[ref] = pick(node, 'type', 'label', 'depth', 'options');

    if (node.type !== 'step') {
        node.children.forEach((child) => fillReferences(refs, child));
    }

    return refs;
}

function mapInfo(node) {
    const info = Object.assign({}, node.info);

    if (info.error) {
        info.error = omit(serializeError(node.info.error), 'stack');
    }

    return info;
}

function reporter(options) {
    options = Object.assign({
        stdout: process.stdout,
    }, options);

    let stdout;  // Need to grab references to the write methods because of step.write.* methods

    return {
        plan: {
            start(plan) {
                stdout = options.stdout.write.bind(options.stdout);
                const refs = fillReferences({}, plan);

                stdout('{\n');
                stdout('  "refs": {\n');
                stdout(indentString(JSON.stringify(refs, null, 2).slice(2, -1), 1, '  '));
                stdout('  },\n');

                stdout('  "actions": [\n');

                const obj = { name: 'plan.start', ref: plan.ref };

                stdout(indentString(JSON.stringify(obj, null, 2), 2, '  ') + ',\n');
            },
            ok(plan) {
                const obj = { name: 'plan.ok', ref: plan.ref, info: mapInfo(plan) };

                stdout(indentString(JSON.stringify(obj, null, 2), 2, '  ') + ',\n');
            },
            fail(plan) {
                const obj = { name: 'plan.fail', ref: plan.ref, info: mapInfo(plan) };

                stdout(indentString(JSON.stringify(obj, null, 2), 2, '  ') + ',\n');
            },
            finish(plan) {
                const obj = { name: 'plan.finish', ref: plan.ref, info: mapInfo(plan) };

                stdout(indentString(JSON.stringify(obj, null, 2), 2, '  ') + '\n');
                stdout('  ]\n');
                stdout('}\n');
            },
        },

        phase: {
            start(phase) {
                const obj = { name: 'phase.start', ref: phase.ref };

                stdout(indentString(JSON.stringify(obj, null, 2), 2, '  ') + ',\n');
            },
            ok(phase) {
                const obj = { name: 'phase.ok', ref: phase.ref, info: mapInfo(phase) };

                stdout(indentString(JSON.stringify(obj, null, 2), 2, '  ') + ',\n');
            },
            fail(phase) {
                const obj = { name: 'phase.fail', ref: phase.ref, info: mapInfo(phase) };

                stdout(indentString(JSON.stringify(obj, null, 2), 2, '  ') + ',\n');
            },
            finish(phase) {
                const obj = { name: 'phase.finish', ref: phase.ref, info: mapInfo(phase) };

                stdout(indentString(JSON.stringify(obj, null, 2), 2, '  ') + ',\n');
            },
        },

        step: {
            start(step) {
                const obj = { name: 'step.start', ref: step.ref };

                stdout(indentString(JSON.stringify(obj, null, 2), 2, '  ') + ',\n');
            },
            write: {
                stdout(step, str) {
                    const obj = { name: 'step.write.stdout', ref: step.ref, str: '' + str };  // str can be a buffer

                    stdout(indentString(JSON.stringify(obj, null, 2), 2, '  ') + ',\n');
                },
                stderr(step, str) {
                    const obj = { name: 'step.write.stderr', ref: step.ref, str: '' + str };  // str can be a buffer

                    stdout(indentString(JSON.stringify(obj, null, 2), 2, '  ') + ',\n');
                },
            },
            ok(step) {
                const obj = { name: 'step.ok', ref: step.ref, info: mapInfo(step) };

                stdout(indentString(JSON.stringify(obj, null, 2), 2, '  ') + ',\n');
            },
            fail(step) {
                const obj = { name: 'step.fail', ref: step.ref, info: mapInfo(step) };

                stdout(indentString(JSON.stringify(obj, null, 2), 2, '  ') + ',\n');
            },
            finish(step) {
                const obj = { name: 'step.finish', ref: step.ref, info: mapInfo(step) };

                stdout(indentString(JSON.stringify(obj, null, 2), 2, '  ') + ',\n');
            },
        },
    };
}

module.exports = reporter;
