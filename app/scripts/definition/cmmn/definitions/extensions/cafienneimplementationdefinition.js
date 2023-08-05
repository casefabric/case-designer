/**
 * Simple helper class to support specific extensions to CMMN   
 */
class CafienneImplementationDefinition extends CMMNExtensionDefinition {
    constructor(element, caseDefinition, parent) {
        super(element, caseDefinition, parent);
    }
}

CafienneImplementationDefinition.TAG = IMPLEMENTATION_TAG;
