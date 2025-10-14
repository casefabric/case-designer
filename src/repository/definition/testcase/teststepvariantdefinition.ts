import { Element } from "../../../util/xml";
import DocumentableElementDefinition from "../documentableelementdefinition";
import TestcaseModelDefinition from "./testcasemodeldefinition";
import TestStepDefinition from "./teststepdefinition";

export default abstract class TestStepVariantDefinition extends DocumentableElementDefinition<TestcaseModelDefinition> {
    static XML_ELEMENT = 'variant';

    content: object;

    constructor(importNode: Element, testcase: TestcaseModelDefinition, public parent: TestStepDefinition) {
        super(importNode, testcase, parent);

        this.content = this.parseElementCDataToObject('content', {});
    }

    createExportNode(parentNode: Element) {
        super.createExportNode(parentNode, TestStepVariantDefinition.XML_ELEMENT);

        this.exportObjectToElementCDATA(parentNode, 'content', this.content);
    }
}    
