import {PassUp} from './pass-up.js';
import {def} from 'trans-render/lib/def.js';

export class PU extends PassUp{
    static is = 'p-u';
}
def(PU);

declare global {
    interface HTMLElementTagNameMap {
        'p-u': PU & HTMLElement;
    }
}