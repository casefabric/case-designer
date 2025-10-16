import { Element } from "../../../util/xml";
import ElementDefinition from "../elementdefinition";
import InternalReference from "../references/internalreference";
import TestcaseModelDefinition from "./testcasemodeldefinition";
import TestStepAssertionSetDefinition from "./teststepassertionsetdefinition";
import TestStepVariantDefinition from "./teststepvariantdefinition";

export default class TestStepPredecessorDefinition extends ElementDefinition<TestcaseModelDefinition> {
    static XML_ELEMENT = 'predessor';
    sourceRef: InternalReference<TestStepVariantDefinition>;


    constructor(importNode: Element, testcase: TestcaseModelDefinition, public parent: TestStepAssertionSetDefinition) {
        super(importNode, testcase, parent);

        this.sourceRef = this.parseInternalReference('sourceRef');
    }

    createExportNode(parentNode: Element) {
        super.createExportNode(parentNode, TestStepPredecessorDefinition.XML_ELEMENT, 'sourceRef');
    }
}    
