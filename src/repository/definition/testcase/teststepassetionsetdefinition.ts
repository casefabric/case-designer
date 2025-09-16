import { Element } from "../../../util/xml";
import DocumentableElementDefinition from "../documentableelementdefinition";
import ElementDefinition from "../elementdefinition";
import TestcaseModelDefinition from "./testcasemodeldefinition";
import TestStepPredecessorDefinition from "./teststepprecessordefinition";

export default abstract class TestStepAssertionSetDefinition extends DocumentableElementDefinition<TestcaseModelDefinition> {
    static XML_ELEMENT = 'assertionset';

    predecessors: TestStepPredecessorDefinition[] = [];

    constructor(importNode: Element, testcase: TestcaseModelDefinition, parent: ElementDefinition<TestcaseModelDefinition>) {
        super(importNode, testcase, parent);

        this.predecessors = this.parseElements(TestStepPredecessorDefinition.XML_ELEMENT, TestStepPredecessorDefinition);
    }

    createExportNode(parentNode: Element) {
        super.createExportNode(parentNode, TestStepAssertionSetDefinition.XML_ELEMENT, 'predecessors');
    }
}    
