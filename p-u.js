import { xc } from 'xtal-element/lib/XtalCore.js';
import { getPreviousSib, nudge, getProp, convert } from 'on-to-me/on-to-me.js';
import { structuralClone } from 'xtal-element/lib/structuralClone.js';
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
    get observedElement() {
        const element = this._wr?.deref();
        if (element !== undefined) {
            return element;
        }
        const elementToObserve = getPreviousSib(this.previousElementSibling, this.observe ?? null);
        this._wr = new WeakRef(elementToObserve);
        return elementToObserve;
    }
}
PU.is = 'p-u';
//TODO:  share common code with p-d.
export const onInitVal = ({ initVal, self }) => {
    const elementToObserve = self.observedElement;
    const foundInitVal = setInitVal(self, elementToObserve);
    // if(!foundInitVal && self.initEvent!== undefined){
    //     elementToObserve.addEventListener(self.initEvent, e => {
    //         setInitVal(self, elementToObserve);
    //     }, {once: true});
    // }
};
function setInitVal(self, elementToObserve) {
    let val = getProp(elementToObserve, self.initVal.split('.'), self);
    if (val === undefined)
        return false;
    if (self.parseValAs !== undefined)
        val = convert(val, self.parseValAs);
    if (self.cloneVal)
        val = structuralClone(val);
    self.lastVal = val;
    return true;
}
const attachEventHandler = ({ on, observe, self }) => {
    const previousElementToObserve = self._wr?.deref();
    self._wr = undefined;
    const elementToObserve = self.observedElement;
    if (!elementToObserve)
        throw "Could not locate element to observe.";
    let doNudge = false;
    if ((previousElementToObserve !== undefined) && (self.previousOn !== undefined || (previousElementToObserve !== elementToObserve))) {
        previousElementToObserve.removeEventListener(self.previousOn || on, self.handleEvent);
    }
    else {
        doNudge = true;
    }
    elementToObserve.addEventListener(on, self.handleEvent, { capture: self.capture });
    if (doNudge) {
        if (elementToObserve === self.parentElement && self.ifTargetMatches) {
            elementToObserve.querySelectorAll(self.ifTargetMatches).forEach(publisher => {
                nudge(publisher);
            });
        }
        else {
            nudge(elementToObserve);
        }
    }
    self.setAttribute('status', '👂');
    self.previousOn = on;
};
const propActions = [attachEventHandler];
const propDefMap = {};
const slicedPropDefs = xc.getSlicedPropDefs(propDefMap);
xc.letThereBeProps(PU, slicedPropDefs, 'onPropChange');
xc.define(PU);
