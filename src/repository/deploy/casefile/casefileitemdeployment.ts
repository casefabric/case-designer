import XML, { Element } from "../../../util/xml";
import Tags from "../../definition/tags";
import SchemaPropertyDefinition from "../../definition/type/schemapropertydefinition";
import CaseDeployment from "../casedeployment";
import TypeDeployment from "./typedeployment";

export default class CaseFileItemDeployment {
    private children: CaseFileItemDeployment[] = [];
    constructor(public typeDeployment: TypeDeployment, public property: SchemaPropertyDefinition, private parent?: CaseFileItemDeployment) {
        if (this.property.schema) {
            this.property.schema.properties.filter(p => p.isComplexType).forEach(child => this.children.push(new CaseFileItemDeployment(typeDeployment, child, this)));
        }
    }

    createCaseFileItem(caseDeployment: CaseDeployment, parent: Element, parentCFIPath: string = '') {
        // Create a CFI element for this property
        const cfi = XML.createChildElement(parent, Tags.CASE_FILE_ITEM);
        const cfiPath = this.createUniqueCFIPath(caseDeployment, parentCFIPath);
        cfi.setAttribute('id', cfiPath);
        cfi.setAttribute('name', this.property.name);
        cfi.setAttribute('multiplicity', this.property.multiplicity.toString());
        cfi.setAttribute('definitionRef', this.definitionRef);
        parent.appendChild(cfi);
        if (this.children.length > 0) {
            const children = XML.createChildElement(cfi, Tags.CHILDREN);
            cfi.appendChild(children);

            // Now iterate our child items and convert the into case file items as well, using our identifier as the new path
            this.children.forEach(child => child.createCaseFileItem(caseDeployment, children, cfiPath));
        }
        
    }

    private get definitionRef() {
        if (this.property.type === 'object') {
            // this.type === 'object', so let's use our path to create an identifier.
            return this.property.modelDefinition.file.fileName.replace('.type', '_type_') + this.property.name + '.object';
        } else {
            return this.property.typeRef;
        }
    }


    createUniqueCFIPath(caseDeployment: CaseDeployment, parentCFIPath: string): string {
        // First generate the default new identifier: either directly the property name, or as an extension to the existing path with a slash.
        const pathPrefix = parentCFIPath ? parentCFIPath + '/' : '';
        const cfiPath = pathPrefix + this.property.name;

        if (caseDeployment.isRoot) {
            // No need to change the cfi paths inside the root case, we do that only in subcases.
            return cfiPath;
        } else {
            // First determine whether the path is already pmaarrefixed with the sub case, 
            const subcasePrefix = caseDeployment.caseName + '/';
            // Check whether the prefix holds the subcase name or not. If not, add it.
            const newCFIPath = (!pathPrefix.startsWith(subcasePrefix) ? subcasePrefix + pathPrefix : pathPrefix) + this.property.name;
            // We're adding the prefix, but in the case definition we're still referring to the path without the prefix. 
            //  Ask the case to update the paths.
            const pathUsedInCaseDefinition = newCFIPath.substring(subcasePrefix.length);
            caseDeployment.updateCaseFileItemReferences(pathUsedInCaseDefinition, newCFIPath);
            return newCFIPath;
        }
    }
}
