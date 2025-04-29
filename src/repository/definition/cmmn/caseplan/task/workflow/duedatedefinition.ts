import { Element } from "../../../../../../util/xml";
import CaseDefinition from "../../../casedefinition";
import ExpressionContainer from "../../../expression/expressioncontainer";
import TaskDefinition from "../taskdefinition";
import CafienneWorkflowDefinition from "./cafienneworkflowdefinition";

export default class DueDateDefinition extends ExpressionContainer {
    static TAG = 'duedate';
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
        return `The ${this.constructor.name} in ${this.getContextElement()}`;
    }

    createExportNode(parentNode: Element) {
        super.createExportNode(parentNode, DueDateDefinition.TAG);
    }
}
