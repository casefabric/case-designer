import { Element } from "../../../../../../util/xml";
import CaseDefinition from "../../../casedefinition";
import ExpressionContainer from "../../../expression/expressioncontainer";
import TaskDefinition from "../taskdefinition";
import CafienneWorkflowDefinition from "./cafienneworkflowdefinition";

export default class AssignmentDefinition extends ExpressionContainer {
    static TAG = 'assignment';

    constructor(importNode: Element, caseDefinition: CaseDefinition, public parent: CafienneWorkflowDefinition) {
        super(importNode, caseDefinition, parent);
    }

    protected expressionTagName() {
        return 'condition';
    }

    getContextElement(): TaskDefinition {
        return this.parent.task;
    }

    getContextDescription(): string {
        return `The ${this} in ${this.parent} of ${this.getContextElement()}`;
    }


    createExportNode(parentNode: Element) {
        super.createExportNode(parentNode, AssignmentDefinition.TAG);
    }
}
