import { CE } from 'trans-render/lib/CE.js';
import { upSearch } from 'trans-render/lib/upSearch.js';
import { getProp, convert, splitExt } from 'on-to-me/prop-mixin.js';
import { structuralClone } from 'trans-render/lib/structuralClone.js';
import { upShadowSearch } from 'trans-render/lib/upShadowSearch.js';
import { OnMixin } from 'on-to-me/on-mixin.js';
const ce = new CE();
/**
 * @element p-u
 * @tag p-u
 */
export class PUCore extends HTMLElement {
    _splitExt;
    valFromEvent(e) {
        const val = this.val || 'target.value';
        if (this._splitExt === undefined)
            this._splitExt = splitExt(val);
        let valToPass = getProp(e, this._splitExt, this);
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
    doEvent({ lastEvent, noblock, toggleProp, prop, eqConst }) {
        this.setAttribute('status', '🌩️');
        if (!noblock && lastEvent.stopPropagation)
            lastEvent.stopPropagation();
        let valToPass = undefined;
        if (toggleProp) {
            valToPass = !this.observedElement[prop];
        }
        else if (eqConst !== undefined) {
            valToPass = eqConst;
        }
        else {
            valToPass = this.valFromEvent(lastEvent);
        }
        this.lastVal = valToPass;
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
    handleValChange = ({ lastVal, to, toNearestUpMatch, toHost, prop, debug, log, toSelf, fn }) => {
        if (lastVal === undefined || (to === undefined && toNearestUpMatch === undefined && !toHost && !toSelf))
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
        else if (toSelf) {
            match = this.observedElement;
        }
        if (match === null)
            return;
        if (prop !== undefined) {
            this.doSet(match, prop, lastVal);
        }
        else if (fn !== undefined) {
            this.doInvoke(match, fn, lastVal);
        }
    };
    doSet(match, prop, lastVal) {
        if (this.plusEq) {
            match[prop] += lastVal;
        }
        else if (this.toggleProp) {
            match[prop] = !match[prop];
        }
        else {
            match[prop] = lastVal;
        }
    }
    doInvoke(match, fn, lastVal) {
        const args = [];
        for (const arg of this.withArgs) {
            switch (arg) {
                case 'self':
                    args.push(match);
                    break;
                case 'val':
                    args.push(lastVal);
                    break;
                case 'event':
                    args.push(this.lastEvent);
                    break;
            }
        }
        match[fn](...args);
    }
    setInitVal({ initVal, parseValAs, cloneVal }, elementToObserve) {
        let val = getProp(elementToObserve, splitExt(initVal), this);
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
        return this.onProp !== undefined ? this.on
            : this.on === undefined ? ce.toLisp(initVal) + '-changed'
                : this.on;
    }
    setValFromTarget({ valFromTarget }) {
        const initVal = valFromTarget === '' ? 'value' : valFromTarget;
        const val = 'target.' + initVal;
        const on = this.onFromProp(initVal);
        this.lastEvent = undefined;
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
            noblock: false, debug: false, log: false, toSelf: false, plusEq: false, toggleProp: false,
            withArgs: ['self', 'val', 'event'],
        },
        propInfo: {
            on: strProp, onProp: strProp, to: strProp, toNearestUpMatch: strProp,
            prop: strProp, val: strProp, observe: strProp, initVal: strProp, eqConst: {},
            parseValAs: strProp, previousOn: strProp, ifTargetMatches: strProp,
            fn: strProp,
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
            locateAndListen: {
                ifKeyIn: ['observe', 'capture', 'on', 'onProp'],
            },
            handleValChange: {
                ifKeyIn: ['lastVal', 'prop', 'fn']
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
    mixins: [OnMixin],
    superclass: PUCore
});
export const PassUp = ce.classDef;
