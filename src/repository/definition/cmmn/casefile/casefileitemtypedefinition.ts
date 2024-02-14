import SchemaPropertyDefinition from "@repository/definition/type/schemapropertydefinition";
import XMLSerializable from "@repository/definition/xmlserializable";
import CaseDefinition from "../casedefinition";
import CaseFileItemDef from "./casefileitemdef";

export default class CaseFileItemTypeDefinition extends CaseFileItemDef {
    property: SchemaPropertyDefinition;
    /**
     * 
     * @param {CaseDefinition} parent 
     * @param {String} id
     */
    static createEmptyDefinition(parent: CaseDefinition, id = undefined) {
        const definition: CaseFileItemDef = parent.createDefinition(CaseFileItemDef, id, '');
        definition.isEmpty = true;
        return definition;
    }

    /**
     * 
     * @param {CaseDefinition} caseDefinition 
     * @param {*} parent 
     * @param {SchemaPropertyDefinition} propertyDefinition 
     */
    constructor(caseDefinition: CaseDefinition, parent: any, propertyDefinition: SchemaPropertyDefinition) {
        super(caseDefinition.importNode.ownerDocument.createElement('will-not-be-exported'), caseDefinition, parent);
        this.property = propertyDefinition;
        this.id = this.getPath();
        this.multiplicity = propertyDefinition.multiplicity;

        const childProperties: SchemaPropertyDefinition[] = this.property.schema ? this.property.schema.properties : this.property.subType ? this.property.subType?.schema?.properties || [] : [];
        childProperties.forEach(child => this.addChild(child));

        this.isEmpty = false;
    }

    set name(value: string) {
        // Override setting the name, because we always take the name from the property we belong to
    }

    get name() {
        return this.property.name;
    }

    referencesElement(element: XMLSerializable) {
        return element.id === this.property.id;
    }

    getPath() {
        const parentPaths = [];
        let ancestor = this.parent;
        while (ancestor && ancestor instanceof CaseFileItemTypeDefinition) {
            parentPaths.push(ancestor.property.name);
            ancestor = ancestor.parent;
        }
        const parent = parentPaths.filter(p => p !== '').reverse().join('/');
        return parent.length > 0 ? parent + '/' + this.property.name : this.property.name;
    }


    addChild(child: SchemaPropertyDefinition) {
        this.children.push(new CaseFileItemTypeDefinition(this.caseDefinition, this, child));
    }

    /**
     * Returns all descending case file items including this one, recursively.
     */
    getDescendants() {
        const descendants: CaseFileItemDef[] = [this];
        this.children.forEach(child => child.getDescendants().forEach((c: CaseFileItemDef) => descendants.push(c)));
        return descendants;
    }

    createExportNode() {
        // We do not need to create any export XML, as the parent CaseFile will set a 'typeRef' attribute that includes us.
        return;
    }
}
