import { Element } from "../../../util/xml";
import CaseDefinition from "../cmmn/casedefinition";
import DocumentableElementDefinition from "../documentableelementdefinition";
import ElementDefinition from "../elementdefinition";
import ExternalReference from "../references/externalreference";
import TestcaseModelDefinition from "./testcasemodeldefinition";

export default class FixtureDefinition extends DocumentableElementDefinition<TestcaseModelDefinition> {
    static XML_ELEMENT = 'fixture';

    caseRef: ExternalReference<CaseDefinition>;

    constructor(importNode: Element, testcase: TestcaseModelDefinition, parent: ElementDefinition<TestcaseModelDefinition>) {
        super(importNode, testcase, parent);

        this.caseRef = this.parseReference('caseRef');
    }

    createExportNode(parentNode: Element) {
        super.createExportNode(parentNode, FixtureDefinition.XML_ELEMENT, 'caseRef');

    }

    get caseDefinition(): CaseDefinition | undefined {
        return this.caseRef.getDefinition();
    }
}    
