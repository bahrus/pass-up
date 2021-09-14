import {CE, PropInfo} from 'trans-render/lib/CE.js';
import {upSearch} from 'trans-render/lib/upSearch.js';
import {getPreviousSib, passVal, nudge, getProp, convert} from 'on-to-me/on-to-me.js';
import { structuralClone } from 'trans-render/lib/structuralClone.js';
import { upShadowSearch } from 'trans-render/lib/upShadowSearch.js';
import {PUActions, PUProps} from './types';
import {OnMixin} from 'on-to-me/on-mixin.js';
import {OnMixinActions, OnMixinProps} from 'on-to-me/types';

const ce = new CE<PUProps & OnMixinProps, PUActions & OnMixinActions>();
/**
 * @element p-u
 * @tag p-u
 */
export class PUCore extends HTMLElement implements PUActions{


    valFromEvent(e: Event){
        let clearTarget = false;
        const val = this.val || 'target.value';
        let valToPass = getProp(e, val.split('.'), this);
        
        if(valToPass === undefined){
            const target = e.target as HTMLElement;
            const attribVal = target.getAttribute(val);
            if(attribVal !== null){
                valToPass = attribVal;
            }
        }
        if(this.parseValAs !== undefined){
            valToPass = convert(valToPass, this.parseValAs);
        }
        return this.cloneVal ? structuralClone(valToPass) :  valToPass;
    }

    doEvent({lastEvent, noblock}: this) {
        this.setAttribute('status', '🌩️');
        if(!this.noblock) lastEvent!.stopPropagation();
        let valToPass = this.valFromEvent(lastEvent!);
        this.lastVal = valToPass;
        //holding on to lastEvent could introduce memory leak
        
        this.setAttribute('status', '👂');
    }

    //TODO:  share common code with pass-down
    doInit({initVal, observedElement}: this){
        const elementToObserve = observedElement;
        const foundInitVal = this.setInitVal(this, elementToObserve!);
        // if(!foundInitVal && self.initEvent!== undefined){
        //     elementToObserve.addEventListener(self.initEvent, e => {
        //         setInitVal(self, elementToObserve);
        //     }, {once: true});
        // }
    }


    
    handleValChange = ({lastVal, to, toNearestUpMatch, toHost, prop, debug, log}: this) => {
        if(lastVal === undefined || (to === undefined && toNearestUpMatch === undefined && toHost === undefined)) return;
        if(debug){
            debugger;
        }else if(log){
            console.log('passVal', {lastVal, self});
        }
        //const hSelf = self as HTMLElement;
        let match: Element | null = null;
        if(to !== undefined){
            match = upShadowSearch(this, to);
        }else if(toNearestUpMatch!== undefined){
            match = upSearch(this, toNearestUpMatch);
        }else if(toHost){
            match = (<any>(this.getRootNode())).host;
        }
        if(match === null) return;
        this.doSet(match, prop!, lastVal);
        
    }

    doSet(match: any, prop: string, lastVal: any){
        match[prop] = lastVal;
    }

    setInitVal({initVal, parseValAs, cloneVal}: this, elementToObserve: Element){
        let val = getProp(elementToObserve, initVal!.split('.'), this);
        if(val === undefined) return false;
        if(parseValAs !== undefined) val = convert(val, parseValAs);
        if(cloneVal) val = structuralClone(val);
        this.lastVal = val;
        return true;
    }

    onFromProp(initVal: string){
        return this.on === undefined ? ce.toLisp(initVal) + '-changed': this.on;
    }

    setValFromTarget({valFromTarget}: this){
        const initVal = valFromTarget === '' ? 'value' : valFromTarget!;
        const val = 'target.' + initVal;
        const on = this.onFromProp(initVal);
        this.lastEvent = undefined;
        return {on, val, initVal};
    };

    setAliases({vft}: this){
        return {
            valFromTarget: vft
        }
    }
}
type mixinProps = PUProps & OnMixinProps;
export interface PUCore extends mixinProps {}
const strProp: PropInfo ={
    type: 'String'
}
ce.def({
    config:{
        tagName: 'p-u',
        propDefaults:{
            toHost: false, cloneVal: false, capture: false,
            noblock: false, debug: false, log: false,
        },
        propInfo:{
            on: strProp, to: strProp, toNearestUpMatch: strProp,
            prop: strProp, val: strProp, observe: strProp, initVal: strProp,
            parseValAs: strProp, previousOn: strProp, ifTargetMatches: strProp,
            lastVal:{
                parse: false,
                dry: false,
            },
            valFromTarget: strProp,
            vft: strProp,
        },
        actions:{
            doEvent:{
                ifAllOf:['lastEvent']
            },
            doInit:{
                ifAllOf:['initVal']
            },
            locateAndListen:{
                ifKeyIn:['observe', 'capture'],
                ifAllOf:['on']
            },
            handleValChange:{
                ifAllOf:['lastVal', 'prop']
            },
            setValFromTarget:{
                ifAllOf: ['valFromTarget'],
            },
            setAliases: {
                ifAllOf: ['vft'],
            }
        },
        style:{
            display:'none'
        }
    },
    mixins: [OnMixin],
    superclass: PUCore
});

export const PassUp = ce.classDef!;




declare global {
    interface HTMLElementTagNameMap {
        'pass-up': PUCore;
    }
}