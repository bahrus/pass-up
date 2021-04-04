import {xc, PropAction, PropDef, PropDefMap, ReactiveSurface} from 'xtal-element/lib/XtalCore.js';
import {getPreviousSib, passVal, nudge, getProp, convert} from 'on-to-me/on-to-me.js';
import {P} from 'pass-down/p.js';

/**
 * @element p-u
 */
export class PU extends P implements ReactiveSurface{
    static is = 'p-u';
    self = this;
    propActions = propActions;
    reactor = new xc.Rx(this);

    connectedCallback(){
        this.style.display = 'none';
        xc.hydrate(this, slicedPropDefs);
    }

    onPropChange(n: string, propDef: PropDef, nv:  any){
        this.reactor.addToQueue(propDef, nv);
    }
}

const propActions = [] as PropAction[];

const propDefMap: PropDefMap<PU> = {

};

const slicedPropDefs = xc.getSlicedPropDefs(propDefMap);

xc.letThereBeProps(PU, slicedPropDefs, 'onPropChange');

xc.define(PU);
