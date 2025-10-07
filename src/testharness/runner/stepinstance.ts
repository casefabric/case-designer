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
        try {
            await this.stepDefinition.execute(instance);
            this.status = "passed";
        } catch (error: any) {

            console.error(`Error in step: ${this.name}`, error.response ?? error);
            this.status = "failed";
            this.description = error.response ?? error.toString();
        }
    }
}
