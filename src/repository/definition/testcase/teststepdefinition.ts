import { Element } from "../../../util/xml";
import DocumentableElementDefinition from "../documentableelementdefinition";
import ElementDefinition from "../elementdefinition";
import TestcaseModelDefinition from "./testcasemodeldefinition";
import TestStepPredecessorDefinition from "./teststepprecessordefinition";
import TestStepVariantDefinition from "./teststepvariantdefinition";

export default abstract class TestStepDefinition extends DocumentableElementDefinition<TestcaseModelDefinition> {
    variants: TestStepVariantDefinition[] = [];
    predessors: TestStepPredecessorDefinition[] = [];

    constructor(importNode: Element, testcase: TestcaseModelDefinition, parent: ElementDefinition<TestcaseModelDefinition>) {
        super(importNode, testcase, parent);

        this.variants = this.parseElements(TestStepVariantDefinition.XML_ELEMENT, TestStepVariantDefinition);
        if (this.variants.length === 0) {
            this.variants.push(this.createDefinition(TestStepVariantDefinition));
        }

        this.predessors = this.parseElements(TestStepPredecessorDefinition.XML_ELEMENT, TestStepPredecessorDefinition);
    }

    createExportNode(parentNode: Element, tagName: string, ...propertyNames: any[]) {
        super.createExportNode(parentNode, tagName, 'variants', 'predecessors', propertyNames);
    }
}    
