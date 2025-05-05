import CaseTeamFile from "../../../repository/serverfile/caseteamfile";
import Util from "../../../util/util";
import { Element } from "../../../util/xml";
import ModelDefinition from "../modeldefinition";
import CaseTeamRoleDefinition from "./caseteamroledefinition";

export default class CaseTeamModelDefinition extends ModelDefinition {
    static TAG: string = 'caseteam';
    public roles: CaseTeamRoleDefinition[];

    static createDefinitionSource(name: string, documentation?: string) {
        return `<caseteam id="${name + '.caseteam'}" name="${name}">
    <documentation textFormat="text/plain">
        <text><![CDATA[${documentation || name}]]></text>
    </documentation>
</caseteam>`;
    }

    constructor(public file: CaseTeamFile) {
        super(file);
        this.roles = this.parseElements('role', CaseTeamRoleDefinition);
    }

    createCaseRole(name: string = '', id = '', documentation = ''): CaseTeamRoleDefinition {
        const caseRole: CaseTeamRoleDefinition = this.createDefinition(CaseTeamRoleDefinition, undefined, id, name);
        caseRole.documentation.text = documentation;
        this.roles.push(caseRole);
        return caseRole;
    }

    createExportNode(parentNode: Element, tagName = CaseTeamModelDefinition.TAG, ...propertyNames: any[]) {
        super.createExportNode(parentNode, tagName, 'roles', propertyNames);
    }

    insert(child: CaseTeamRoleDefinition, after?: CaseTeamRoleDefinition) {
        Util.insertInArray(this.roles, child, after);
    }

    toXML() {
        const xmlDocument = super.exportModel('caseteam', 'roles');
        return xmlDocument;
    }
}
