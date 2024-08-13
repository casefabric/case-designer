import UnnamedCMMNElementDefinition from "../../unnamedcmmnelementdefinition";
import CaseRoleDefinition from "./caseroledefinition";

export default class CaseTeamDefinition extends UnnamedCMMNElementDefinition {
    constructor(importNode, caseDefinition, parent) {
        super(importNode, caseDefinition, parent);
        /** @type {Array<CaseRoleDefinition>} */
        this.roles = this.parseElements('role', CaseRoleDefinition);
        // Clear our name and id element, so that caseteam definition is not accidentally found as a case role element
        this.name = undefined;
        this.id = undefined;
    }

    createExportNode(parentNode) {
        super.createExportNode(parentNode, 'caseRoles', 'roles');
    }
}
