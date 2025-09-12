import { Element } from "../../../util/xml";
import ElementDefinition from "../elementdefinition";
import TestcaseModelDefinition from "./testcasemodeldefinition";
import TestStepDefinition from "./teststepdefinition";

export default class CaseFileStepDefinition extends TestStepDefinition {
    static XML_ELEMENT = 'casefilestep';

    constructor(importNode: Element, testcase: TestcaseModelDefinition, parent: ElementDefinition<TestcaseModelDefinition>) {
        super(importNode, testcase, parent);
    }

    createExportNode(parentNode: Element) {
        super.createExportNode(parentNode, CaseFileStepDefinition.XML_ELEMENT);
    }
}    
