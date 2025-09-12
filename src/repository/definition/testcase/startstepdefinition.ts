import { Element } from "../../../util/xml";
import ElementDefinition from "../elementdefinition";
import TestcaseModelDefinition from "./testcasemodeldefinition";
import TestStepDefinition from "./teststepdefinition";

export default class StartStepDefinition extends TestStepDefinition {
    static XML_ELEMENT = 'startstep';

    constructor(importNode: Element, testcase: TestcaseModelDefinition, parent: ElementDefinition<TestcaseModelDefinition>) {
        super(importNode, testcase, parent);
    }

    createExportNode(parentNode: Element) {
        super.createExportNode(parentNode, StartStepDefinition.XML_ELEMENT);
    }
}    
