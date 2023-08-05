/**
 * Simple helper class to support specific extension <cafienne:implementation>  
 */
class UnnamedCMMNElementDefinition extends CMMNElementDefinition {
    isNamedElement() {
        return false;
    }
}