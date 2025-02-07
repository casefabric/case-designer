import { Element } from "../../../../../../util/xml";
import CMMNElementDefinition from "../../../../cmmnelementdefinition";
import CaseDefinition from "../../../casedefinition";
import ExpressionContainer from "../../../expression/expressioncontainer";

export default class AssignmentDefinition extends ExpressionContainer {
    static TAG = 'assignment';

    constructor(importNode: Element, caseDefinition: CaseDefinition, public parent: CMMNElementDefinition) {
        super(importNode, caseDefinition, parent);
    }

    get expressionTagName() {
        return 'condition';
    }

    createExportNode(parentNode: Element) {
        super.createExportNode(parentNode, AssignmentDefinition.TAG);
    }
}
