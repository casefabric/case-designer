import { Element } from "../../../../../util/xml";
import CaseDefinition from "../../casedefinition";
import CaseFileItemReference from "../../casefile/casefileitemreference";
import ConstraintDefinition from "../constraintdefinition";
import TaskStageDefinition from "../taskstagedefinition";
import PlanningTableDefinition from "./planningtabledefinition";

export class ApplicabilityRuleDefinition extends ConstraintDefinition {
    constructor(importNode: Element, caseDefinition: CaseDefinition, public parent: PlanningTableDefinition) {
        super(importNode, caseDefinition, parent);
    }

    // Override isNamedElement; by default Constraints are unnamed, but applicability rules form the exception
    isNamedElement() {
        return true;
    }

    getContextElement(): TaskStageDefinition {
        return this.parent.parent;
    }

    getContextDescription(): string {
        return `The applicability rule '${this.name}' in the planning table of ${this.getContextElement()}`;
    }

    set sourceRef(ref: string) {
        this.contextRef.update(ref);
    }

    get sourceRef(): CaseFileItemReference {
        return this.contextRef;
    }

    createExportNode(parentNode: Element) {
        super.createExportNode(parentNode, 'applicabilityRule');
    }
}