import { Element } from "../../../util/xml";
import DocumentableElementDefinition from "../documentableelementdefinition";
import ElementDefinition from "../elementdefinition";
import TestcaseModelDefinition from "./testcasemodeldefinition";

export default abstract class TestStepVariantDefinition extends DocumentableElementDefinition<TestcaseModelDefinition> {
    static XML_ELEMENT = 'variant';

    content: string;

    constructor(importNode: Element, testcase: TestcaseModelDefinition, parent: ElementDefinition<TestcaseModelDefinition>) {
        super(importNode, testcase, parent);

        this.content = this.parseElementText('inputs', '');
    }

    createExportNode(parentNode: Element) {
        super.createExportNode(parentNode, TestStepVariantDefinition.XML_ELEMENT, 'inputs');
    }
}    
