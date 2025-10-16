import TestStepDefinition from "../../repository/definition/testcase/teststepdefinition";
import TestStepVariantDefinition from "../../repository/definition/testcase/teststepvariantdefinition";
import TestcaseInstance from "./testcaseinstance";

export default class StepInstance {
    status: "pending" | "running" | "passed" | "failed" = "pending";
    description: string = "";

    constructor(public stepDefinition: TestStepDefinition, public variant: TestStepVariantDefinition | null) {

    }



    get name() {
        return `${this.stepDefinition.name}${this.variant ? '.' + this.variant.name : ''}`;
    }


    async run(instance: TestcaseInstance): Promise<void> {
        console.log(`Running step: ${this.name}`);
        if (!await this.assertionsChecked(instance)) {
            console.log(`Step ${this.name} not executed due to failed assertions`);
            return;
        }

        try {
            await this.stepDefinition.execute(instance, this.variant);
            this.status = "passed";
        } catch (error: any) {

            console.error(`Error in step: ${this.name}`, error.response ?? error);
            this.status = "failed";
            this.description = error.response ?? error.toString();
        }
    }

    async assertionsChecked(instance: TestcaseInstance): Promise<boolean> {
        if (this.stepDefinition.assertionSet) {
            for (const assertion of this.stepDefinition.assertionSet.assertions) {
                const result = await assertion.execute(instance);
                if (!result.success) {
                    this.status = "failed";
                    this.description = result.message ?? "Assertion failed";
                    return false;
                }
            }
        }
        return true;
    }
}
