import Slm from './slm.js';
import extractIdentifiers, { extractLocalDeclarations } from '../utils/extract_identifiers.js';

function IdentifierCollector() {}

const p = IdentifierCollector.prototype = new Slm();

// Capture passing options to access the shared context for extracting identifiers.
p.exec = function(exp, options) {
    this.options = options;
    return Object.getPrototypeOf(IdentifierCollector.prototype).exec.call(this, exp);
};

p.on_slm_output = function (exps) {
    if (this.options && this.options._identifiers) {
        const ids = extractIdentifiers(exps[3], this.options.destructuringExclude);
        ids.forEach(id => this.options._identifiers.add(id));
        const locals = extractLocalDeclarations(exps[3]);
        locals.forEach(id => this.options._locals.add(id));
    }
    return ['slm', 'output', exps[2], exps[3], this.compile(exps[4])];
};

p.on_slm_control = function (exps) {
    if (this.options && this.options._identifiers) {
        const ids = extractIdentifiers(exps[2], this.options.destructuringExclude);
        ids.forEach(id => this.options._identifiers.add(id));
        const locals = extractLocalDeclarations(exps[2]);
        locals.forEach(id => this.options._locals.add(id));
    }
    return ['slm', 'control', exps[2], this.compile(exps[3])];
};

p.on_slm_attrvalue = function (exps) {
    if (this.options && this.options._identifiers) {
        const ids = extractIdentifiers(exps[3], this.options.destructuringExclude);
        ids.forEach(id => this.options._identifiers.add(id));
        const locals = extractLocalDeclarations(exps[3]);
        locals.forEach(id => this.options._locals.add(id));
    }
    return ['slm', 'attrvalue', exps[2], exps[3]];
};

export default IdentifierCollector;
