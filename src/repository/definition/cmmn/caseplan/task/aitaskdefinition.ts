import AIFile from "../../../../../repository/serverfile/aifile";
import { Element } from "../../../../../util/xml";
import Validator from "../../../../validate/validator";
import ExternalReference from "../../../references/externalreference";
import CaseDefinition from "../../casedefinition";
import StageDefinition from "../stagedefinition";
import TaskDefinition from "./taskdefinition";
import AIModelDefinition from "../../../../../repository/definition/ai/aimodeldefinition";

export default class AITaskDefinition extends TaskDefinition {
    processRef: ExternalReference<AIModelDefinition>;
    protected infix() {
        return 'ai';
    }

    constructor(importNode: Element, caseDefinition: CaseDefinition, public parent: StageDefinition) {
        super(importNode, caseDefinition, parent);
        this.processRef = this.parseReference('processRef');
    }

    validate(validator: Validator): void {
        super.validate(validator);
        super.validateImplementation(validator);
    }

    get implementationReference() {
        return this.processRef;
    }

    get implementationModel() {
        return this.implementationReference.getDefinition();
    }

    createExportNode(parentNode: Element) {
        super.createExportNode(parentNode, 'aiTask', 'processRef', 'mappings');
    }

    get implementationClass() {
        return AIFile;
    }

    get implementationRef() {
        return this.processRef.fileName;
    }

    set implementationRef(ref) {
        this.processRef.update(ref);
    }
}
