import { xc } from 'xtal-element/lib/XtalCore.js';
import { getPreviousSib, nudge, getProp, convert } from 'on-to-me/on-to-me.js';
import { structuralClone } from 'xtal-element/lib/structuralClone.js';
import { upShadowSearch } from 'trans-render/lib/upShadowSearch.js';
/**
 * @element p-u
 */
export class PU extends HTMLElement {
    static is = 'p-u';
    self = this;
    propActions = propActions;
    reactor = new xc.Rx(this);
    /**
     * The event name to monitor for, from previous non-petalian element.
     * @attr
     */
    on;
    /**
     * Id of Dom Element.  Uses import-like syntax:
     * ./my-id searches for #my-id within ShadowDOM realm of pass-up (p-u) instance.
     * ../my-id searches for #my-id one ShadowDOM level up.
     * /my-id searches from outside any ShadowDOM.
     * @attr
     */
    to;
    /**
     * Pass property to custom element hosting the contents of p-u element.
     */
    toHost;
    /**
     * Pass property to the nearest previous sibling / ancestor element matching this css pattern, using .previousElement(s)/.parentElement.matches method.
     * Does not pass outside ShadowDOM realm.
     */
    toNearestUpMatch;
    /**
     * Name of property to set on matching (downstream) siblings.
     * @attr
     */
    prop;
    /**
     * Specifies path to JS object from event, that should be passed to downstream siblings.  Value of '.' passes entire entire object.
     * @attr
     */
    val;
    /**
     * Specifies element to latch on to, and listen for events.
     * Searches previous siblings, parent, previous siblings of parent, etc.
     * Stops at Shadow DOM boundary.
     * @attr
     */
    observe;
    initVal;
    cloneVal;
    parseValAs;
    /**
     * A Boolean indicating that events of this type will be dispatched to the registered listener before being dispatched to any EventTarget beneath it in the DOM tree.
    */
    capture;
    /**
     * @private
     */
    previousOn;
    /**
     * @private
     */
    lastEvent;
    /**
     * Only act on event if target element css-matches the expression specified by this attribute.
     * @attr
     */
    ifTargetMatches;
    /**
     * Don't block event propagation.
     * @attr
     */
    noblock;
    /**
    * @private
    */
    lastVal;
    debug;
    log;
    connectedCallback() {
        this.style.display = 'none';
        xc.mergeProps(this, slicedPropDefs);
    }
    onPropChange(n, propDef, nv) {
        this.reactor.addToQueue(propDef, nv);
    }
    _wr;
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
    //https://web.dev/javascript-this/
    handleEvent = (e) => {
        if (this.ifTargetMatches !== undefined) {
            if (!e.target.matches(this.ifTargetMatches))
                return;
        }
        if (!this.filterEvent(e))
            return;
        this.lastEvent = e;
    };
    valFromEvent(e) {
        let clearTarget = false;
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
        upEl = upEl.previousElementSibling || upEl.parentElement;
    }
    return upEl;
}
export const handleValChange = ({ lastVal, to, toNearestUpMatch, toHost, prop, self }) => {
    if (lastVal === undefined || (to === undefined && toNearestUpMatch === undefined && toHost === undefined))
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
    else if (toHost) {
        match = self.getRootNode().host;
    }
    if (match === null)
        return;
    match[prop] = lastVal;
};
const propActions = [onInitVal, attachEventHandler, handleEvent, handleValChange];
const baseProp = {
    dry: true,
    async: true,
};
const objProp = {
    ...baseProp,
    type: Object,
};
const nnObjProp = {
    ...objProp,
    stopReactionsIfFalsy: true,
};
const strProp = {
    ...baseProp,
    type: String,
};
const boolProp = {
    ...baseProp,
    type: Boolean,
};
const nnStrProp = {
    ...strProp,
    stopReactionsIfFalsy: true,
};
const propDefMap = {
    on: nnStrProp,
    to: strProp,
    toNearestUpMatch: strProp,
    toHost: boolProp,
    observe: strProp,
    initVal: nnStrProp,
    prop: nnStrProp,
    lastVal: objProp,
    lastEvent: {
        ...nnObjProp,
        async: false,
    },
    val: nnStrProp,
};
const slicedPropDefs = xc.getSlicedPropDefs(propDefMap);
xc.letThereBeProps(PU, slicedPropDefs, 'onPropChange');
xc.define(PU);
