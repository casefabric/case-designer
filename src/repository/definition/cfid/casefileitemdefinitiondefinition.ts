import CFIDFile from "../../serverfile/cfidfile";
import ModelDefinition from "../modeldefinition";
import PropertyDefinition from "./propertydefinition";

export const UNSPECIFIED = 'Unspecified';
export const UNSPECIFIED_URI = 'http://www.omg.org/spec/CMMN/DefinitionType/Unspecified';

export const XMLELEMENT = 'XMLElement';
export const XMLELEMENT_URI = 'http://www.omg.org/spec/CMMN/DefinitionType/XSDElement';

export const UNKNOWN = 'Unknown';
export const UNKNOWN_URI = 'http://www.omg.org/spec/CMMN/DefinitionType/Unknown';

export default class CaseFileDefinitionDefinition extends ModelDefinition {
    definitionType: string = '';
    structureRef: string = '';
    importRef: string = '';
    properties: PropertyDefinition[] = [];
    /**
     * Imports an XML element and parses it into a in-memory definition structure.
     */
    constructor(public file: CFIDFile) {
        super(file);
        this.definitionType = this.parseAttribute('definitionType', UNSPECIFIED_URI);
        this.structureRef = this.parseAttribute('structureRef', '');
        this.importRef = this.parseAttribute('importRef', '');
        this.properties = this.parseElements('property', PropertyDefinition)
    }

    toXML() {
        return super.exportModel('caseFileItemDefinition', 'id', 'name', 'definitionType', 'structureRef', 'importRef', 'properties');
    }
}
