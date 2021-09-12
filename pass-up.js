import { CE } from 'trans-render/lib/CE.js';
import { upSearch } from 'trans-render/lib/upSearch.js';
import { getPreviousSib, nudge, getProp, convert } from 'on-to-me/on-to-me.js';
import { structuralClone } from 'trans-render/lib/structuralClone.js';
import { upShadowSearch } from 'trans-render/lib/upShadowSearch.js';
const ce = new CE();
/**
 * @element p-u
 * @tag p-u
 */
export class PUCore extends HTMLElement {
    #wr;
    get observedElement() {
        const element = this.#wr?.deref();
        if (element !== undefined) {
            return element;
        }
        const elementToObserve = getPreviousSib(this.previousElementSibling, this.observe ?? null);
        this.#wr = new WeakRef(elementToObserve);
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
    doEvent({ lastEvent, noblock }) {
        this.setAttribute('status', '🌩️');
        if (!this.noblock)
            lastEvent.stopPropagation();
        let valToPass = this.valFromEvent(lastEvent);
        this.lastVal = valToPass;
        //holding on to lastEvent could introduce memory leak
        delete this.lastEvent;
        this.setAttribute('status', '👂');
    }
    //TODO:  share common code with pass-down
    doInit({ initVal, observedElement }) {
        const elementToObserve = observedElement;
        const foundInitVal = this.setInitVal(this, elementToObserve);
        // if(!foundInitVal && self.initEvent!== undefined){
        //     elementToObserve.addEventListener(self.initEvent, e => {
        //         setInitVal(self, elementToObserve);
        //     }, {once: true});
        // }
    }
    //TODO:  share common code with pass-down
    attachEventHandler({ on, observe, observedElement, parentElement, ifTargetMatches, previousOn, handleEvent, capture }) {
        const previousElementToObserve = this.#wr?.deref();
        this.#wr = undefined;
        const elementToObserve = this.observedElement;
        if (!elementToObserve)
            throw "Could not locate element to observe.";
        let doNudge = false;
        if ((previousElementToObserve !== undefined) && (previousOn !== undefined || (previousElementToObserve !== elementToObserve))) {
            previousElementToObserve.removeEventListener(previousOn || on, handleEvent);
        }
        else {
            doNudge = true;
        }
        elementToObserve.addEventListener(on, handleEvent, { capture: capture });
        if (doNudge) {
            if (elementToObserve === parentElement && ifTargetMatches) {
                elementToObserve.querySelectorAll(ifTargetMatches).forEach(publisher => {
                    nudge(publisher);
                });
            }
            else {
                nudge(elementToObserve);
            }
        }
        this.setAttribute('status', '👂');
        this.previousOn = on;
    }
    handleValChange = ({ lastVal, to, toNearestUpMatch, toHost, prop, debug, log }) => {
        if (lastVal === undefined || (to === undefined && toNearestUpMatch === undefined && toHost === undefined))
            return;
        if (debug) {
            debugger;
        }
        else if (log) {
            console.log('passVal', { lastVal, self });
        }
        //const hSelf = self as HTMLElement;
        let match = null;
        if (to !== undefined) {
            match = upShadowSearch(this, to);
        }
        else if (toNearestUpMatch !== undefined) {
            match = upSearch(this, toNearestUpMatch);
        }
        else if (toHost) {
            match = (this.getRootNode()).host;
        }
        if (match === null)
            return;
        this.doSet(match, prop, lastVal);
    };
    doSet(match, prop, lastVal) {
        match[prop] = lastVal;
    }
    setInitVal({ initVal, parseValAs, cloneVal }, elementToObserve) {
        let val = getProp(elementToObserve, initVal.split('.'), this);
        if (val === undefined)
            return false;
        if (parseValAs !== undefined)
            val = convert(val, parseValAs);
        if (cloneVal)
            val = structuralClone(val);
        this.lastVal = val;
        return true;
    }
    onFromProp(initVal) {
        return this.on === undefined ? ce.toLisp(initVal) + '-changed' : this.on;
    }
    setValFromTarget({ valFromTarget }) {
        const initVal = valFromTarget === '' ? 'value' : valFromTarget;
        const val = 'target.' + initVal;
        const on = this.onFromProp(initVal);
        return { on, val, initVal };
    }
    ;
    setAliases({ vft }) {
        return {
            valFromTarget: vft
        };
    }
}
const strProp = {
    type: 'String'
};
ce.def({
    config: {
        tagName: 'p-u',
        propDefaults: {
            toHost: false, cloneVal: false, capture: false,
            noblock: false, debug: false, log: false,
        },
        propInfo: {
            on: strProp, to: strProp, toNearestUpMatch: strProp,
            prop: strProp, val: strProp, observe: strProp, initVal: strProp,
            parseValAs: strProp, previousOn: strProp, ifTargetMatches: strProp,
            lastVal: {
                parse: false,
                dry: false,
            },
            valFromTarget: strProp,
            vft: strProp,
        },
        actions: {
            doEvent: {
                ifAllOf: ['lastEvent']
            },
            doInit: {
                ifAllOf: ['initVal']
            },
            attachEventHandler: {
                ifKeyIn: ['observe', 'capture'],
                ifAllOf: ['on']
            },
            handleValChange: {
                ifAllOf: ['lastVal', 'prop']
            },
            setValFromTarget: {
                ifAllOf: ['valFromTarget'],
            },
            setAliases: {
                ifAllOf: ['vft'],
            }
        },
        style: {
            display: 'none'
        }
    },
    superclass: PUCore
});
export const PassUp = ce.classDef;