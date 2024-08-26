import CriterionDefinition from "./criteriondefinition";

export default class ReactivateCriterionDefinition extends CriterionDefinition {
    /**
     * @param {Element} parentNode 
     */
    createExportNode(parentNode) {
        super.createExtensionNode(parentNode, ReactivateCriterionDefinition.TAG, 'id', 'name', 'documentation', 'ifPart', 'caseFileItemOnParts', 'planItemOnParts');
    }
}

ReactivateCriterionDefinition.TAG = 'reactivateCriterion';
