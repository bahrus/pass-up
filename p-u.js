import { xc } from 'xtal-element/lib/XtalCore.js';
import { getPreviousSib, nudge, getProp, convert } from 'on-to-me/on-to-me.js';
import { structuralClone } from 'xtal-element/lib/structuralClone.js';
import { upShadowSearch } from 'trans-render/lib/upShadowSearch.js';
/**
 * @element p-u
 */
export class PU extends HTMLElement {
    constructor() {
        super(...arguments);
        this.self = this;
        this.propActions = propActions;
        this.reactor = new xc.Rx(this);
        //https://web.dev/javascript-this/
        this.handleEvent = (e) => {
            if (this.ifTargetMatches !== undefined) {
                if (!e.target.matches(this.ifTargetMatches))
                    return;
            }
            if (!this.filterEvent(e))
                return;
            this.lastEvent = e;
        };
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
    filterEvent(e) {
        return true;
    }
    valFromEvent(e) {
        const val = this.val || 'target.value';
        let valToPass = getProp(e, val.split('.'), this);
        if (valToPass === undefined) {
            const target = e.target;
            const attribVal = target.getAttribute(val);
            if (attribVal !== null) {
                valToPass = attribVal;
            }
        }
        if (this.parseValAs !== undefined) {
            valToPass = convert(valToPass, this.parseValAs);
        }
        return this.cloneVal ? structuralClone(valToPass) : valToPass;
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
export const handleEvent = ({ val, lastEvent, parseValAs, self }) => {
    if (!lastEvent) {
        debugger;
    }
    self.setAttribute('status', '🌩️');
    if (!self.noblock)
        lastEvent.stopPropagation();
    let valToPass = self.valFromEvent(lastEvent);
    self.lastVal = valToPass;
    //holding on to lastEvent could introduce memory leak
    delete self.lastEvent;
    self.setAttribute('status', '👂');
};
//copied from mut-obs [TODO] share?]
export function upSearch(el, css) {
    if (css === 'parentElement')
        return el.parentElement;
    let upEl = el.previousElementSibling || el.parentElement;
    while (upEl && !upEl.matches(css)) {
        upEl = el.previousElementSibling || el.parentElement;
    }
    return upEl;
}
export const handleValChange = ({ lastVal, to, toNearestUpMatch, prop, self }) => {
    if (lastVal === undefined || (to === undefined && toNearestUpMatch === undefined))
        return;
    if (self.debug) {
        debugger;
    }
    else if (self.log) {
        console.log('passVal', { lastVal, self });
    }
    const hSelf = self;
    let match = null;
    if (to !== undefined) {
        match = upShadowSearch(self, to);
    }
    else if (toNearestUpMatch !== undefined) {
        match = upSearch(self, toNearestUpMatch);
    }
    if (match === null)
        return;
    match[prop] = lastVal;
};
const propActions = [onInitVal, attachEventHandler, handleValChange];
const baseProp = {
    dry: true,
    async: true,
};
const objProp = {
    ...baseProp,
    type: Object,
};
const strProp = {
    ...baseProp,
    type: String,
};
const nnStrProp = {
    ...strProp,
    stopReactionsIfFalsy: true,
};
const propDefMap = {
    on: nnStrProp,
    to: strProp,
    toNearestUpMatch: strProp,
    observe: strProp,
    initVal: nnStrProp,
    prop: nnStrProp,
    lastVal: objProp,
};
const slicedPropDefs = xc.getSlicedPropDefs(propDefMap);
xc.letThereBeProps(PU, slicedPropDefs, 'onPropChange');
xc.define(PU);
