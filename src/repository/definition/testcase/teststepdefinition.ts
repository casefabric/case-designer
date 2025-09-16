import { Element } from "../../../util/xml";
import DocumentableElementDefinition from "../documentableelementdefinition";
import ElementDefinition from "../elementdefinition";
import TestcaseModelDefinition from "./testcasemodeldefinition";
import TestStepAssertionSetDefinition from "./teststepassetionsetdefinition";
import TestStepVariantDefinition from "./teststepvariantdefinition";

export default abstract class TestStepDefinition extends DocumentableElementDefinition<TestcaseModelDefinition> {
    variants: TestStepVariantDefinition[] = [];
    assertionSet: TestStepAssertionSetDefinition;

    constructor(importNode: Element, testcase: TestcaseModelDefinition, parent: ElementDefinition<TestcaseModelDefinition>) {
        super(importNode, testcase, parent);

        this.variants = this.parseElements(TestStepVariantDefinition.XML_ELEMENT, TestStepVariantDefinition);
        if (this.variants.length === 0) {
            this.variants.push(this.createDefinition(TestStepVariantDefinition));
        }

        this.assertionSet = this.parseElement(TestStepAssertionSetDefinition.XML_ELEMENT, TestStepAssertionSetDefinition) ?? this.createDefinition(TestStepAssertionSetDefinition);
    }

    createExportNode(parentNode: Element, tagName: string, ...propertyNames: any[]) {
        super.createExportNode(parentNode, tagName, 'variants', 'assertionSet', propertyNames);
    }
}    
