import XML, { Element } from "../../../util/xml";
import Tags from "../../definition/tags";
import SchemaPropertyDefinition from "../../definition/type/schemapropertydefinition";
import TypeDeployment from "./typedeployment";

export default class CFIDPropertyDeployment {
    constructor(public typeDeployment: TypeDeployment, public property: SchemaPropertyDefinition) {
        if (! this.property.isPrimitiveType) {
            // skipping complex properties from CFID.
            throw new Error('Only primitive properties can be deployed as <property> in a <caseFileItemDefinition>');
        }
    }

    appendToCFID(parent: Element) {
        const propertyElement = XML.createChildElement(parent, Tags.PROPERTY);
        propertyElement.setAttribute('name', this.property.name);
        propertyElement.setAttribute('type', `http://www.omg.org/spec/CMMN/PropertyType/${this.property.cmmnType}`);
        if (this.property.isBusinessIdentifier) {
            const extensionNode = XML.createChildElement(propertyElement, 'extensionElements');
            extensionNode.setAttribute('mustUnderstand', 'false');
            propertyElement.appendChild(extensionNode);
            const implementationNode = XML.createChildElement(propertyElement, 'cafienne:implementation');
            implementationNode.setAttribute('isBusinessIdentifier', 'true');
            extensionNode.appendChild(implementationNode);
        }
    }
}
