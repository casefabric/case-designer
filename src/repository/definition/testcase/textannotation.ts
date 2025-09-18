import XML, { Element } from "../../../util/xml";
import DocumentableElementDefinition from "../documentableelementdefinition";
import TestcaseModelDefinition from "./testcasemodeldefinition";
import TestPlanDefinition from "./testplandefinition";

export default class TextAnnotationDefinition extends DocumentableElementDefinition<TestcaseModelDefinition> {
    textFormat: string;
    text: any;

    constructor(importNode: Element, public definition: TestcaseModelDefinition, parent: TestPlanDefinition) {
        super(importNode, definition, parent);
        this.textFormat = this.parseAttribute('textFormat');
        const textElement = XML.getChildByTagName(this.importNode, 'text');
        this.text = textElement ? XML.getCDATANodeOrSelf(textElement).textContent : '';
    }

    createExportNode(parentNode: Element) {
        super.createExportNode(parentNode, 'textAnnotation', 'textFormat');

        const textElement = XML.createChildElement(this.exportNode, 'text');
        const textCDataNode = this.exportNode.ownerDocument.createCDATASection(this.text);
        textElement.appendChild(textCDataNode);
    }
}
