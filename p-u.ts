import {xc, PropAction, PropDef, PropDefMap, ReactiveSurface, IReactor} from 'xtal-element/lib/XtalCore.js';
import {getPreviousSib, passVal, nudge, getProp, convert} from 'on-to-me/on-to-me.js';

/**
 * @element p-u
 */
export class PU extends HTMLElement implements ReactiveSurface{
    static is = 'p-u';
    self = this;
    propActions = propActions;
    reactor: IReactor = new xc.Rx(this);

    /**
     * The event name to monitor for, from previous non-petalian element.
     * @attr
     */
    on: string | undefined;


    /**
     * css pattern to match for from downstream siblings.
     * @attr
     */
    to: string | undefined;

    toClosest: string | undefined;

    /**
     * Name of property to set on matching (downstream) siblings.
     * @attr
     */
    prop: string | undefined;

    /**
     * Specifies path to JS object from event, that should be passed to downstream siblings.  Value of '.' passes entire entire object.
     * @attr
     */
    val: string | undefined;

    /**
     * Specifies element to latch on to, and listen for events.
     * Searches previous siblings, parent, previous siblings of parent, etc.
     * Stops at Shadow DOM boundary.
     * @attr
     */
    observe: string | undefined;

    initVal: string | undefined;

    cloneVal: boolean | undefined;

    connectedCallback(){
        this.style.display = 'none';
        xc.mergeProps(this, slicedPropDefs);
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
