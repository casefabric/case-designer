import { Element } from "../../../util/xml";
import DocumentableElementDefinition from "../documentableelementdefinition";
import AssertionDefinition, { CaseInstanceAssertionDefinition } from "./assertiondefinition";
import TestcaseModelDefinition from "./testcasemodeldefinition";
import TestStepDefinition from "./teststepdefinition";

export default abstract class TestStepAssertionSetDefinition extends DocumentableElementDefinition<TestcaseModelDefinition> {
    static XML_ELEMENT = 'assertionset';

    assertions: AssertionDefinition[];

    constructor(importNode: Element, testcase: TestcaseModelDefinition, public parent: TestStepDefinition) {
        super(importNode, testcase, parent);

        this.assertions = parent.constructor.name == 'FinishStepDefinition' ?
            [new CaseInstanceAssertionDefinition(importNode, testcase, this)] : [];
    }

    createExportNode(parentNode: Element) {
        super.createExportNode(parentNode, TestStepAssertionSetDefinition.XML_ELEMENT);
    }
}    
