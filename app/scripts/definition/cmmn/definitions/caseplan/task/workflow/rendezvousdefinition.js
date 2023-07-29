class RendezVousDefinition extends TaskPairingDefinition {
    /**
     * 
     * @param {*} importNode 
     * @param {*} caseDefinition 
     * @param {PlanItem} parent 
     */
    constructor(importNode, caseDefinition, parent) {
        super(importNode, caseDefinition, parent);
    }

    /**
     * @param {PlanItem} item 
     * @returns {TaskPairingDefinition}
     */
    counterPartOf(item) {
        return item.rendezVous;
    }

    createExportNode(parentNode) {
        if (this.present) {
            super.createExportNode(parentNode, RendezVousDefinition.TAG);
        }
    }
}

RendezVousDefinition.TAG = 'rendez_vous';
