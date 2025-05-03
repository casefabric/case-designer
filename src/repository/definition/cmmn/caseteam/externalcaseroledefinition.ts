import { Element } from "../../../../util/xml";
import CaseTeamRoleDefinition from "../../caseteam/caseteamroledefinition";
import CaseDefinition from "../casedefinition";
import CaseRoleDefinition from "./caseroledefinition";
import CaseTeamDefinition from "./caseteamdefinition";

export default class ExternalCaseRoleDefinition extends CaseRoleDefinition {
    constructor(importNode: Element, public caseDefinition: CaseDefinition, parent: CaseTeamDefinition, private externalRole: CaseTeamRoleDefinition) {
        super(importNode, caseDefinition, parent);
        if (externalRole.documentation.text) {
            this.documentation.text = externalRole.documentation.text;
        }
    }

    get id() {
        return this.externalRole.id;
    }

    set id(id) {
        if (this.externalRole) this.externalRole.id = id;
    }

    get name() {
        return this.externalRole.name;
    }

    set name(name) {
        if (this.externalRole) this.externalRole.name = name;
    }

    get documentation() {
        return this.externalRole.documentation;
    }

    createExportNode() {
        // We do not need to create any export XML, as this is done in the CaseTeamModelDefinition itself.
        return;
    }
}
