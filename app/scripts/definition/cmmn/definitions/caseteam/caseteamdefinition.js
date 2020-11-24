class CaseTeamDefinition extends UnnamedCMMNElementDefinition {
    constructor(importNode, caseDefinition, parent) {
        super(importNode, caseDefinition, parent);
        /** @type {Array<CaseRoleDefinition>} */
        this.roles = this.parseElements('role', CaseRoleDefinition);
        if (this.roles.length == 0 && this.name) {
            // This means we bumped into a CMMN 1.0 role
            console.log('Converting CMMN1.0 role');
            this.importNode.appendChild(CaseTeamDefinition.convertRoleDefinition(importNode));
            this.roles = this.parseElements('role', CaseRoleDefinition);
            this.caseDefinition.migrated = true;
        }
    }

    static convertRoleDefinition(element) {
        const id = element.getAttribute('id');
        const name = element.getAttribute('name');
        const description = element.getAttribute('description');
        element.removeAttribute('id');
        element.removeAttribute('name');
        element.removeAttribute('description');
        const optionalDescription = name !== description ? `description="${description}"` : ''; 
        return XML.parseXML(`<role id="${id}" name="${name}" ${optionalDescription}/>`).documentElement;
    }

    createExportNode(parentNode) {
        // Only export if there are actual roles defined in this case
        if (this.roles.length) {
            super.createExportNode(parentNode, 'caseRoles', 'roles');
        }
    }
}