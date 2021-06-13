import {xc, PropAction, PropDef, PropDefMap, ReactiveSurface, IReactor} from 'xtal-element/lib/XtalCore.js';
import {getPreviousSib, passVal, nudge, getProp, convert} from 'on-to-me/on-to-me.js';
import { structuralClone } from 'xtal-element/lib/structuralClone.js';

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

    /**
     * Pass property to the nearest ancestor element matching this css pattern, using the closest() method. 
     */
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

    parseValAs: 'int' | 'float' | 'bool' | 'date' | 'truthy' | 'falsy' | undefined;

    /**
     * A Boolean indicating that events of this type will be dispatched to the registered listener before being dispatched to any EventTarget beneath it in the DOM tree.
    */
    capture!: boolean;

    /**
     * @private
     */
    previousOn: string | undefined;

    /**
     * @private
     */
    lastEvent: Event | undefined;

    /**
     * Only act on event if target element css-matches the expression specified by this attribute.
     * @attr
     */
    ifTargetMatches: string | undefined;
      

    /**
    * @private
    */
    lastVal: any;

    connectedCallback(){
        this.style.display = 'none';
        xc.mergeProps(this, slicedPropDefs);
    }

    onPropChange(n: string, propDef: PropDef, nv:  any){
        this.reactor.addToQueue(propDef, nv);
    }

    _wr: WeakRef<Element> | undefined;
    get observedElement(){
        const element = this._wr?.deref();
        if(element !== undefined){
            return element;
        }
        const elementToObserve = getPreviousSib(this.previousElementSibling as HTMLElement, this.observe ?? null) as Element;
        this._wr = new WeakRef(elementToObserve);
        return elementToObserve;
    }

    filterEvent(e: Event) : boolean{
        return true;
    }

    //https://web.dev/javascript-this/
    handleEvent = (e: Event) => {
        if(this.ifTargetMatches !== undefined){
            if(!(e.target as HTMLElement).matches(this.ifTargetMatches)) return;
        }
        if(!this.filterEvent(e)) return;
        this.lastEvent = e;
    }
}

//TODO:  share common code with p-d.
export const onInitVal = ({initVal, self}: PU) => {
    const elementToObserve = self.observedElement;
    const foundInitVal = setInitVal(self, elementToObserve);
    // if(!foundInitVal && self.initEvent!== undefined){
    //     elementToObserve.addEventListener(self.initEvent, e => {
    //         setInitVal(self, elementToObserve);
    //     }, {once: true});
    // }
}

function setInitVal(self: PU, elementToObserve: Element){
    
    let val = getProp(elementToObserve, self.initVal!.split('.'), self);
    if(val === undefined) return false;
    if(self.parseValAs !== undefined) val = convert(val, self.parseValAs);
    if(self.cloneVal) val = structuralClone(val);
    self.lastVal = val;
    return true;
}


const attachEventHandler = ({on, observe, self}: PU) => {
    const previousElementToObserve = self._wr?.deref();
    self._wr = undefined;
    const elementToObserve = self.observedElement;
    if(!elementToObserve) throw "Could not locate element to observe.";
    let doNudge = false;
    if((previousElementToObserve !== undefined) && (self.previousOn !== undefined || (previousElementToObserve !== elementToObserve))){
        previousElementToObserve.removeEventListener(self.previousOn || on!, self.handleEvent);
    }else{
        doNudge = true;
    }
    elementToObserve.addEventListener(on!, self.handleEvent, {capture: self.capture});
    if(doNudge){
        if(elementToObserve === self.parentElement && self.ifTargetMatches){
            elementToObserve.querySelectorAll(self.ifTargetMatches).forEach(publisher =>{
                nudge(publisher);
            });
        }else{
            nudge(elementToObserve);
        }
        
    }
    self.setAttribute('status', '👂');
    self.previousOn = on;
    
}

const propActions = [setInitVal, attachEventHandler] as PropAction[];

const propDefMap: PropDefMap<PU> = {

};

const slicedPropDefs = xc.getSlicedPropDefs(propDefMap);

xc.letThereBeProps(PU, slicedPropDefs, 'onPropChange');

xc.define(PU);
