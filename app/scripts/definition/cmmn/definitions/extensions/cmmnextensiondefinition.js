/**
 * Simple helper class to support specific extensions to CMMN   
 */
class CMMNExtensionDefinition extends XMLElementDefinition {
    constructor(element, caseDefinition, parent) {
        super(element, caseDefinition, parent);
    }

    createExportNode(parentNode, tagName, ...propertyNames) {
        super.createExtensionNode(parentNode, tagName, propertyNames);
    }
}
