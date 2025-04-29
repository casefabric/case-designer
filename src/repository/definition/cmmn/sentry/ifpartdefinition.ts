import { Element } from "../../../../util/xml";
import CaseDefinition from "../casedefinition";
import ConstraintDefinition from "../caseplan/constraintdefinition";
import PlanItem from "../caseplan/planitem";
import CriterionDefinition from "./criteriondefinition";

export default class IfPartDefinition extends ConstraintDefinition {
    constructor(importNode: Element, caseDefinition: CaseDefinition, public parent: CriterionDefinition) {
        super(importNode, caseDefinition, parent);
    }

    createExportNode(parentNode: Element) {
        super.createExportNode(parentNode, 'ifPart');
    }

    getContextElement(): PlanItem {
        return this.parent.parent;
    }

    getContextDescription(): string {
        return `The if part in ${this.parent} of ${this.getContextElement()}`;
    }
}
