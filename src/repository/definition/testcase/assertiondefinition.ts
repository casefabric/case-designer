import { assertCasePlan, State } from "@casefabric/typescript-client";
import { Element } from "@xmldom/xmldom";
import TestcaseInstance from "../../../testharness/runner/testcaseinstance";
import DocumentableElementDefinition from "../documentableelementdefinition";
import TestcaseModelDefinition from "./testcasemodeldefinition";
import TestStepAssertionSetDefinition from "./teststepassertionsetdefinition";

export default class AssertionDefinition extends DocumentableElementDefinition<TestcaseModelDefinition> {
    static XML_ELEMENT = 'assertion';

    constructor(importNode: Element, testcase: TestcaseModelDefinition, public parent: TestStepAssertionSetDefinition) {
        super(importNode, testcase, parent);

    }
    async execute(instance: TestcaseInstance): Promise<AssertionResult> {
        return new AssertionResult(true);
    }
}

export class CaseInstanceAssertionDefinition extends AssertionDefinition {
    static XML_ELEMENT = 'caseInstanceAssertion';

    async execute(instance: TestcaseInstance): Promise<AssertionResult> {

        try {
            if (instance.caseInstance) {
                await assertCasePlan(instance.tenantOwner, instance.caseInstance?.id, State.Completed);
            }
            return new AssertionResult(true);
        }
        catch (error: any) {
            return new AssertionResult(false, error.message);
        }
    }
}

export class AssertionResult {
    success: boolean;
    message?: string;

    constructor(success: boolean, message?: string) {
        this.success = success;
        this.message = message;
    }
}
