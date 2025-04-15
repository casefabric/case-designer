import { Element } from "../../../../util/xml";
import CMMNElementDefinition from "../../cmmnelementdefinition";
import CaseDefinition from "../casedefinition";
import ExpressionContainer from "../expression/expressioncontainer";

export default abstract class ConstraintDefinition extends ExpressionContainer {
    constructor(importNode: Element, caseDefinition: CaseDefinition, public parent: CMMNElementDefinition) {
        super(importNode, caseDefinition, parent);
    }

    protected expressionTagName() {
        return 'condition';
    }

    createTooltip(ruleDescription: string) {
        // If no rule body - that's actually an error...
        if (!this.body) {
            return 'An expression is missing for this ' + ruleDescription;
        }
        const prefix = `${ruleDescription} expression`;
        // Most rules have 'true' as default value, if so, return it in a more concise version
        if (this.body === 'true') {
            return `${prefix}:\n\t${this.body}`;
        }

        const context = this.contextName ? 'Case file context is set to ' + this.contextName : 'Note: case file context is NOT set for the expression';
        const headline = `${prefix}:\n\n\t`;
        return `${headline}${this.body}\n\n\n${context}`;
    }
}
