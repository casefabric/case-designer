import ValidationContext from "@repository/validate/validation";
import UnnamedCMMNElementDefinition from "../../unnamedcmmnelementdefinition";
import CaseDefinition from "../casedefinition";
import ConstraintDefinition from "./constraintdefinition";
import PlanItem, { TaskStageDefinition } from "./planitem";
import StageDefinition from "./stagedefinition";

export default class PlanningTableDefinition extends UnnamedCMMNElementDefinition {
    tableItems: any;
    ruleDefinitions: ApplicabilityRuleDefinition[];

    constructor(importNode: Element, caseDefinition: CaseDefinition, public parent: TaskStageDefinition) {
        super(importNode, caseDefinition, parent);
        this.parent = parent;
        // @ts-ignore PlanningTables cannot exist inside PlanningTables (as of now)
        const parentStage: StageDefinition = parent.isTask ? parent.parent : parent;
        /** @type{Array<PlanItem>} */
        this.tableItems = parentStage.parseChildren(this);
        this.tableItems.forEach((item: PlanItem) => item.parent = this);
        /** @type{Array<ApplicabilityRuleDefinition>} */
        this.ruleDefinitions = this.parseElements('applicabilityRule', ApplicabilityRuleDefinition);
        // TODO: PlanningTables can be nested in themselves, according to the spec. But we will not implement that here.
    }

    getAllPlanItems() {
        const items: PlanItem[] = new Array(...this.tableItems); // First copy all table entries
        this.tableItems.forEach((item: PlanItem) => { // And for those that are of type stage, get the content as well.
            if (item instanceof StageDefinition) {
                items.push(...item.getAllPlanItems());
            }
        });

        return items;
    }

    createExportNode(parentNode: Element) {
        super.createExportNode(parentNode, 'planningTable', 'tableItems', 'ruleDefinitions');
    }

    createNewRule() {
        const newRule: ApplicabilityRuleDefinition = super.createDefinition(ApplicabilityRuleDefinition);
        this.ruleDefinitions.push(newRule);
        return newRule;
    }

    validate(validationContext: ValidationContext) {
        super.validate(validationContext);

        StageDefinition.validatePlanItems(validationContext, this.tableItems);

        for (let rule of this.ruleDefinitions) {
            rule.validate(validationContext);
        }
    }
}

export class ApplicabilityRuleDefinition extends ConstraintDefinition {
    constructor(importNode: Element, caseDefinition: CaseDefinition, parent: PlanningTableDefinition) {
        super(importNode, caseDefinition, parent);
    }

    // Override isNamedElement; by default Constraints are unnamed, but applicability rules form the exception
    isNamedElement() {
        return true;
    }

    set sourceRef(ref) {
        this.contextRef = ref;
    }

    get sourceRef() {
        return this.contextRef ? this.contextRef : '';
    }

    createExportNode(parentNode: Element) {
        super.createExportNode(parentNode, 'applicabilityRule');
    }
    validate(validationContext: ValidationContext) {
        super.validate(validationContext);
    }
}