import { Element } from "../../../util/xml";
import ElementDefinition from "../elementdefinition";
import InternalReference from "../references/internalreference";
import TestcaseModelDefinition from "./testcasemodeldefinition";
import TestStepDefinition from "./teststepdefinition";
import TestStepVariantDefinition from "./teststepvariantdefinition";

export default class TestStepPredecessorDefinition extends TestStepDefinition {
    static XML_ELEMENT = 'predessor';
    sourceRef: InternalReference<TestStepVariantDefinition>;


    constructor(importNode: Element, testcase: TestcaseModelDefinition, parent: ElementDefinition<TestcaseModelDefinition>) {
        super(importNode, testcase, parent);

        this.sourceRef = this.parseInternalReference('sourceref');
    }

    createExportNode(parentNode: Element) {
        super.createExportNode(parentNode, TestStepPredecessorDefinition.XML_ELEMENT);
    }
}    
