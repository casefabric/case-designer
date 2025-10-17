import XML, { Element } from "../../../util/xml";
import DocumentableElementDefinition from "../documentableelementdefinition";
import TestcaseModelDefinition from "./testcasemodeldefinition";
import TestStepDefinition from "./teststepdefinition";

export default abstract class TestStepVariantDefinition extends DocumentableElementDefinition<TestcaseModelDefinition> {
    static XML_ELEMENT = 'variant';

    content: string;

    constructor(importNode: Element, testcase: TestcaseModelDefinition, public parent: TestStepDefinition) {
        super(importNode, testcase, parent);

        const textElement = XML.getChildByTagName(this.importNode, 'content');
        this.content = textElement ? XML.getCDATANodeOrSelf(textElement).textContent : '';
    }

    createExportNode(parentNode: Element) {
        super.createExportNode(parentNode, TestStepVariantDefinition.XML_ELEMENT);

        const textElement = XML.createChildElement(this.exportNode, 'content');
        const textCDataNode = this.exportNode.ownerDocument.createCDATASection(this.content);
        textElement.appendChild(textCDataNode);
    }
}    
