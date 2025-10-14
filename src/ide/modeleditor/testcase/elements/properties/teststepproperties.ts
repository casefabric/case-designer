import TestStepView from "../teststepview";
import TestCaseProperties from "./testcaseproperties";

export default class TestStepProperties<V extends TestStepView> extends TestCaseProperties<V> {
    renderData(): void {
        super.renderData();

        this.addNameField();
    }
}
