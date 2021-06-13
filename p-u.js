import { xc } from 'xtal-element/lib/XtalCore.js';
/**
 * @element p-u
 */
export class PU extends HTMLElement {
    constructor() {
        super(...arguments);
        this.self = this;
        this.propActions = propActions;
        this.reactor = new xc.Rx(this);
    }
    connectedCallback() {
        this.style.display = 'none';
        xc.mergeProps(this, slicedPropDefs);
    }
    onPropChange(n, propDef, nv) {
        this.reactor.addToQueue(propDef, nv);
    }
}
PU.is = 'p-u';
const propActions = [];
const propDefMap = {};
const slicedPropDefs = xc.getSlicedPropDefs(propDefMap);
xc.letThereBeProps(PU, slicedPropDefs, 'onPropChange');
xc.define(PU);
