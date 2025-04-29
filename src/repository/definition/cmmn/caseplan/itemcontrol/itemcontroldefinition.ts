import { Element } from "../../../../../util/xml";
import UnnamedCMMNElementDefinition from "../../../unnamedcmmnelementdefinition";
import CaseDefinition from "../../casedefinition";
import PlanItem from "../planitem";
import { ManualActivationRuleDefinition, RepetitionRuleDefinition, RequiredRuleDefinition } from "./itemcontrolruledefinition";

export default class ItemControlDefinition extends UnnamedCMMNElementDefinition {
    repetitionRule?: RepetitionRuleDefinition;
    requiredRule?: RequiredRuleDefinition;
    manualActivationRule?: ManualActivationRuleDefinition;

    constructor(importNode: Element, caseDefinition: CaseDefinition, public parent: PlanItem) {
        super(importNode, caseDefinition, parent);
        this.repetitionRule = this.parseElement('repetitionRule', RepetitionRuleDefinition);
        this.requiredRule = this.parseElement('requiredRule', RequiredRuleDefinition);
        this.manualActivationRule = this.parseElement('manualActivationRule', ManualActivationRuleDefinition);
    }

    /**
     * Gets or creates one of 'repetitionRule', 'requiredRule' or 'manualActivationRule'.
     */
    getRule(ruleName: string) {
        
        if (! (this as any)[ruleName]) {
            (this as any)[ruleName] = super.createDefinition(this.findClass(ruleName));
        }
        return (this as any)[ruleName];
    }

    private findClass(ruleName: string): Function {
        switch (ruleName) {
            case 'repetitionRule': return RepetitionRuleDefinition;
            case 'requiredRule': return RequiredRuleDefinition;
            case 'manualActivationRule': return ManualActivationRuleDefinition;
            default: throw new Error(`A rule of type ${ruleName} is not allowed in plan item control`);
        }
    }

    /**
     * Removes one of 'repetitionRule', 'requiredRule' or 'manualActivationRule'.
     */
    removeRule(ruleName: string) {
        delete (this as any)[ruleName];
    }

    createExportNode(parentNode: Element) {
        if (this.repetitionRule || this.requiredRule || this.manualActivationRule) {
            // Only export if there are any rules
            super.createExportNode(parentNode, 'itemControl', 'repetitionRule', 'requiredRule', 'manualActivationRule');
        }
    }
}
