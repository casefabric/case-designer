import XML, { Element } from "../../util/xml";
import ElementDefinition from "./elementdefinition";
import ModelDefinition from "./modeldefinition";

export default class CMMNDocumentationDefinition extends ElementDefinition<ModelDefinition> {
    textFormat: string;
    text: string;
    static createDocumentationElement(importNode: Element|undefined, modelDefinition: ModelDefinition, parent?: ElementDefinition<ModelDefinition>) {
        if (importNode === undefined) {
            importNode = modelDefinition.createImportNode('documentation');
            if (parent && parent.importNode) {
                parent.importNode.appendChild(importNode);
            }
        }
        return new CMMNDocumentationDefinition(importNode, modelDefinition, parent);
    }

    constructor(importNode: Element, definition: ModelDefinition, parent?: ElementDefinition<ModelDefinition>) {
        super(importNode, definition, parent);
        this.textFormat = this.parseAttribute('textFormat', 'text/plain');
        const textElement = XML.getChildByTagName(this.importNode, 'text');
        this.text = textElement ? XML.getCDATANodeOrSelf(textElement).textContent : '';
    }

    createExportNode(parentNode: Element, tagName: string) {
        if (!this.text) {
            return;
        }
        super.createExportNode(parentNode, tagName, 'textFormat');
        const textElement = XML.createChildElement(this.exportNode, 'text');
        const textCDataNode = this.exportNode.ownerDocument.createCDATASection(this.text);
        textElement.appendChild(textCDataNode);
    }
}
