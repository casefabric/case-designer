import { Element } from "../../../../util/xml";
import CaseDefinition from "../casedefinition";
import CMMNElementDefinition from "../cmmnelementdefinition";
import CaseTeamDefinition from "./caseteamdefinition";

export default class CaseRoleDefinition extends CMMNElementDefinition {
    constructor(importNode: Element, public caseDefinition: CaseDefinition, parent: CaseTeamDefinition) {
        super(importNode, caseDefinition, parent);
    }

    createExportNode(parentNode: Element) {
        super.createExportNode(parentNode, 'role');
    }
}
