import XML, { Element } from "../../../util/xml";
import Tags from "../../definition/tags";
import TypeDefinition from "../../definition/type/typedefinition";
import CaseDeployment from "../casedeployment";
import DefinitionDeployment from "../definitiondeployment";
import Definitions from "../definitions";
import CaseFileItemDeployment from "./casefileitemdeployment";
import CFIDPropertyDeployment from "./cfidproperty";

export default class TypeDeployment extends DefinitionDeployment {
    caseFileItems: CaseFileItemDeployment[] = [];
    cfidProperties: CFIDPropertyDeployment[] = [];

    constructor(public definitionsDocument: Definitions, public definition: TypeDefinition) {
        super(definitionsDocument, definition);
        definition.schema.properties.forEach(property => {
            if (property.isPrimitiveType) {
                console.log(definition.file.fileName + ": Pushing primitive for property " + property.name +" with type " + property.type +"")
                this.cfidProperties.push(new CFIDPropertyDeployment(this, property));
            } else {
                console.log(definition.file.fileName + ": Pushing cfi for property " + property.name +" with type " + property.type +"")
                this.caseFileItems.push(new CaseFileItemDeployment(this, property));
            }
        });
    }

    createElement(): Element {
        const cfidElement = XML.createChildElement(this.definitionsDocument.definitionsElement, Tags.CASE_FILE_ITEM_DEFINITION);
        cfidElement.setAttribute('name', this.definition.name);
        cfidElement.setAttribute('definitionType', 'http://www.omg.org/spec/CMMN/DefinitionType/Unspecified');
        cfidElement.setAttribute('id', this.definition.id);
        return cfidElement;
    }

    fillCaseFile(caseDeployment: CaseDeployment) {
        caseDeployment.caseFileModel.setAttribute('cafienne:typeRef', this.fileName);
        caseDeployment.caseFileModel.removeAttribute('typeRef');

        this.caseFileItems.forEach(property => property.createCaseFileItem(caseDeployment, caseDeployment.caseFileModel));
    }

    append() {
        this.cfidProperties.forEach(property => property.appendToCFID(this.element));
    }
}
