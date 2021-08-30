export interface PUProps{
    /**
     * The event name to monitor for, from previous non-petalian element.
     * @attr
     */
     on?: string;  
     
    /**
     * Id of Dom Element.  Uses import-like syntax:
     * ./my-id searches for #my-id within ShadowDOM realm of pass-up (p-u) instance.
     * ../my-id searches for #my-id one ShadowDOM level up.
     * /my-id searches from outside any ShadowDOM.
     * @attr
     */
    to?: string;

    /**
     * Pass property to custom element hosting the contents of p-u element.
     */
    toHost?: boolean;

    /**
     * Pass property to the nearest previous sibling / ancestor element matching this css pattern, using .previousElement(s)/.parentElement.matches method. 
     * Does not pass outside ShadowDOM realm.
     */
    toNearestUpMatch?: string;

    /**
     * Name of property to set on matching (upstream) siblings.
     * @attr
     */
    prop?: string;

    /**
     * Specifies path to JS object from event, that should be passed to downstream siblings.  Value of '.' passes entire entire object.
     * @attr
     */
    val?: string;   
    
    /**
     * Specifies element to latch on to, and listen for events.
     * Searches previous siblings, parent, previous siblings of parent, etc.
     * Stops at Shadow DOM boundary.
     * @attr
     */
    observe?: string;

    initVal?: string | undefined;

    cloneVal?: boolean | undefined;

    parseValAs?: 'int' | 'float' | 'bool' | 'date' | 'truthy' | 'falsy' | undefined;

    /**
     * A Boolean indicating that events of this type will be dispatched to the registered listener before being dispatched to any EventTarget beneath it in the DOM tree.
    */
    capture?: boolean;

    /**
     * @private
     */
    previousOn?: string;

    /**
     * @private
     */
    lastEvent?: Event;

    /**
     * Only act on event if target element css-matches the expression specified by this attribute.
     * @attr
     */
    ifTargetMatches?: string;

    /**
     * Don't block event propagation.
     * @attr
     */
    noblock?: boolean;
      

    /**
    * @private
    */
    lastVal?: any;

    debug?: boolean;

    log?: boolean;
}

export interface PUActions{
    doEvent(self: this): void;
    doInit(self: this): void;
    attachEventHandler(self: this): void;
    handleValChange(self: this): void;
}