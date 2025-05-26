import Compatibility from './compatibility/compatibility';
import IDE from './ide';

// Constructors of some classes must still be available as global pointers on the window element :(
Compatibility.registerClasses();

declare global {
    interface Window { ide: IDE; }
}

// Start initialization after the entire page is loaded
window.addEventListener('load', e => window.ide = new IDE());
