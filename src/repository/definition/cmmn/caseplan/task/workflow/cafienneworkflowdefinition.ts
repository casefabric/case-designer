import { Element } from "../../../../../../util/xml";
import CaseDefinition from "../../../../cmmn/casedefinition";
import ParameterMappingDefinition from "../../../../cmmn/contract/parametermappingdefinition";
import CafienneImplementationDefinition from "../../../../extensions/cafienneimplementationdefinition";
import HumanTaskModelDefinition from "../../../../humantask/humantaskmodeldefinition";
import ProcessModelDefinition from "../../../../process/processmodeldefinition";
import ExternalReference from "../../../../references/externalreference";
import CMMNElementDefinition from "../../../cmmnelementdefinition";
import HumanTaskDefinition from "../humantaskdefinition";
import AssignmentDefinition from "./assignmentdefinition";
import DueDateDefinition from "./duedatedefinition";

export default class CafienneWorkflowDefinition extends CMMNElementDefinition {
    humanTaskRef: ExternalReference<HumanTaskModelDefinition>;
    validatorRef: ExternalReference<ProcessModelDefinition>;
    mappings: ParameterMappingDefinition[];
    assignment?: AssignmentDefinition;
    dueDate?: DueDateDefinition;
    constructor(importNode: Element, caseDefinition: CaseDefinition, public task: HumanTaskDefinition) {
        super(importNode, caseDefinition, task);
        this.humanTaskRef = this.parseReference('humanTaskRef');
        this.validatorRef = this.parseReference('validatorRef');
        this.mappings = this.parseElements('parameterMapping', ParameterMappingDefinition);
        this.assignment = this.parseElement(AssignmentDefinition.TAG, AssignmentDefinition);
        this.dueDate = this.parseElement(DueDateDefinition.TAG, DueDateDefinition);
    }

    resolvedExternalReferences() {
        this.task.bindImplementation();
    }

    get inputs() {
        return this.task.inputs;
    }

    createExportNode(parentNode: Element) {
        if (this.mappings.length > 0 || this.humanTaskRef.nonEmpty || this.assignment || this.dueDate || this.validatorRef.nonEmpty) {
            super.createExtensionNode(parentNode, CafienneImplementationDefinition.TAG, 'humanTaskRef', 'validatorRef', 'mappings', 'assignment', 'dueDate');
        }
    }
}
