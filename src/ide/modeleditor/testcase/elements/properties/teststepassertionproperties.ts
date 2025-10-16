import TestStepAssertionsView from "../testassertionsview";
import TestCaseProperties from "./testcaseproperties";

export default class TestStepAssertionProperties extends TestCaseProperties<TestStepAssertionsView> {

    renderData(): void {
        super.renderData();

        const assertions = this.view.definition.assertions;
    }
}
