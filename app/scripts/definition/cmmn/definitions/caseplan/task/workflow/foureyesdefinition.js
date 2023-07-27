class FourEyesDefinition extends CMMNExtensionDefinition {
    /**
     * 
     * @param {*} importNode 
     * @param {*} caseDefinition 
     * @param {PlanItem} parent 
     */
    constructor(importNode, caseDefinition, parent) {
        super(importNode, caseDefinition, parent);
        this.parent = parent;
        this.present = importNode instanceof Element;
        this.opposites = this.parseElements('task', PlanItemReference);
    }

    get present() {
        return this._present || this.opposites.length > 0;
    }

    /**
     * @param {Boolean} value 
     */
    set present(value) {
        this._present = value;
    }

    createExportNode(parentNode) {
        if (this.present || this.opposites.length > 0) {
            super.createExportNode(parentNode, FourEyesDefinition.TAG, 'opposites');
        }
    }

    /**
     * @returns {Array<PlanItem>}
     */
    get tasks() {
        return this.opposites.map(ref => ref.task);
    }

    drop() {
        // Remove references to us from our opposites.
        this.opposites.map(ref => ref.task).forEach(item => {
            item.fourEyes.removeReference(this.parent);
            if (item.fourEyes.opposites.length === 0) {
                item.fourEyes.present = false;
            }
        });
        // Drop our opposites
        this.opposites = [];
        // We're no longer present either.
        this.present = false;
    }

    /**
     * 
     * @param {PlanItem} task 
     * @returns {Boolean}
     */
    has(task) {
        return this.opposites.find(ref => ref.is(task));
    }

    /**
     * 
     * @param {PlanItem} item 
     */
    add(item) {
        this.adoptReference(item);
        item.fourEyes.adoptReference(this.parent)
    }

    /**
     * 
     * @param {PlanItem} item 
     */
    remove(item) {
        this.removeReference(item);
        item.fourEyes.removeReference(this.parent);
    }

    /**
     * 
     * @param {PlanItem} item 
     * @returns {PlanItemReference}
     */
    adoptReference(item) {
        const existing = this.opposites.find(ref => ref.is(item))
        if (existing) return existing;

        const ref = this.createDefinition(PlanItemReference);
        ref.adopt(item);
        this.opposites.push(ref);
        return ref;
    }

    removeReference(item) {
        Util.removeFromArray(this.opposites, this.opposites.find(ref => ref.is(item)));
    }
}

FourEyesDefinition.TAG = 'four_eyes';
