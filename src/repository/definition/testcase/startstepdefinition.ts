import TestcaseInstance from "../../../testharness/runner/testcaseinstance";
import { Element } from "../../../util/xml";
import ElementDefinition from "../elementdefinition";
import TestcaseModelDefinition from "./testcasemodeldefinition";
import TestStepAssertionSetDefinition from "./teststepassertionsetdefinition";
import TestStepDefinition from "./teststepdefinition";
import TestStepVariantDefinition from "./teststepvariantdefinition";

export default class StartStepDefinition extends TestStepDefinition {
    static XML_ELEMENT = 'startstep';

    constructor(importNode: Element, testcase: TestcaseModelDefinition, parent: ElementDefinition<TestcaseModelDefinition>) {
        super(importNode, testcase, parent);
    }
    protected createDefaultAssertionSetDefinition(): TestStepAssertionSetDefinition | undefined {
        return undefined;
    }

    createExportNode(parentNode: Element) {
        super.createExportNode(parentNode, StartStepDefinition.XML_ELEMENT);
    }

    async execute(instance: TestcaseInstance, variant?: TestStepVariantDefinition | null): Promise<void> {
        await instance.startCaseInstance(variant?.content);
    }
}    
