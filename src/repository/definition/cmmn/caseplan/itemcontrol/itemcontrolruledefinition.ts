import { Element } from "../../../../../util/xml";
import CaseDefinition from "../../casedefinition";
import ConstraintDefinition from "../constraintdefinition";
import PlanItem from "../planitem";
import ItemControlDefinition from "./itemcontroldefinition";

export default abstract class ItemControlRuleDefinition extends ConstraintDefinition {
    constructor(importNode: Element, caseDefinition: CaseDefinition, public parent: ItemControlDefinition) {
        super(importNode, caseDefinition, parent);
    }

    getContextElement(): PlanItem {
        return this.parent.parent;
    }

    getContextDescription(): string {
        return `The ${this.name} in ${this.getContextElement()}`;
    }
}

export class RepetitionRuleDefinition extends ItemControlRuleDefinition {}
export class RequiredRuleDefinition extends ItemControlRuleDefinition {}
export class ManualActivationRuleDefinition extends ItemControlRuleDefinition {}
