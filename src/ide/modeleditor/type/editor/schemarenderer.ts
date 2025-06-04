import CaseFileDefinition from "../../../../repository/definition/cmmn/casefile/casefiledefinition";
import CaseFileItemTypeDefinition from "../../../../repository/definition/cmmn/casefile/casefileitemtypedefinition";
import SchemaDefinition from "../../../../repository/definition/type/schemadefinition";
import SchemaPropertyDefinition from "../../../../repository/definition/type/schemapropertydefinition";
import HtmlUtil from "../../../util/htmlutil";
import LocalTypeDefinition from "./localtypedefinition";
import PropertyRenderer from "./propertyrenderer";
import TypeEditor from "./typeeditor";
import TypeRenderer from "./typerenderer";

export default class SchemaRenderer extends TypeRenderer<SchemaDefinition> {
    constructor(editor: TypeEditor, public parent: PropertyRenderer | undefined, public htmlContainer: JQuery<HTMLElement>, localType: LocalTypeDefinition, public schema = localType.definition.schema) {
        super(editor, parent, localType, schema, htmlContainer);
    }

    render() {
        this.htmlContainer.css('display', 'block');
        this.schema.properties.forEach(property => this.createPropertyRenderer(property));
    }

    createPropertyRenderer(property: SchemaPropertyDefinition): PropertyRenderer {
        const newPropertyRenderer = new PropertyRenderer(this, this.htmlContainer, this.localType, property);
        newPropertyRenderer.render();
        return newPropertyRenderer;
    }

    addEmptyPropertyRenderer(sibling?: PropertyRenderer): PropertyRenderer {
        const newProperty = this.schema.createChildProperty();
        const newPropertyRenderer = this.createPropertyRenderer(newProperty);
        if (sibling) {
            this.schema.insert(newPropertyRenderer.property, sibling.property);
            newPropertyRenderer.html.insertAfter(sibling.html);
        }

        // Also add the new property to the case file definitions that have a reference us.
        //  Note: "that reference us." ==> this means reference either to TypeDefinition or SchemaPropertyDefinition surrounding "us", "us" being the SchemaDefinition
        this.schema.searchInboundReferences().forEach(reference => {
            if (reference instanceof CaseFileItemTypeDefinition || reference instanceof CaseFileDefinition) {
                reference.addChild(newProperty);
            }
        });

        return newPropertyRenderer;
    }

    refresh() {
        this.children.forEach(child => child.delete());
        HtmlUtil.clearHTML(this.htmlContainer);
        this.render();
    }

    /**
     * Returns true if the typeRef is available as type in this renderer.
     */
    hasCycle(source: PropertyRenderer, typeRef: string): string {
        if (this.schema === this.localType.definition.schema && this.localType.file.fileName === typeRef) {
            if (source.parent === this) {
                return 'Property ' + source.name + ' in ' + typeRef + ' cannot refer to its own type';
            } else if (this.parent) {
                return 'Property ' + source.name + ' uses ' + typeRef + ', but that type is also used in ' + this.propertyName;
            } else {
                return 'Property ' + source.name + ' uses ' + typeRef + ', but that is the main type';
            }
        } else {
            return super.hasCycle(source, typeRef);
        }
    }
}
