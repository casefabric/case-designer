class CanvasElement {
    /**
     * @param {CMMNElementView | Case} element 
     */
    constructor(element) {
        this.case = element instanceof Case ? element : element.case;
    }

    set xyz_joint(jointElement) {
        this.__jointElement = jointElement;
        jointElement.xyz_cmmn = this;
    }

    get xyz_joint() {
        return this.__jointElement;
    }

    /**
     * Hook invoked after the element has moved.
     * @param {number} x 
     * @param {number} y 
     * @param {CanvasElement} newParent - optional new parent 
     */
    moved(x, y, newParent) {        
    }

    /**
     * Hook invoked upon mouseEnter
     */
    mouseEnter() {
    }

    /**
     * Hook invoked upon mouseLeave
     */
    mouseLeave() {}
}