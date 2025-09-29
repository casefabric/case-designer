import TestStepVariantDefinition from "../../../../../repository/definition/testcase/teststepvariantdefinition";
import TestStepVariantView from "../teststepvariantview";
import TestCaseHalo from "./testcasehalo";
import TestStepConnectorHaloItem from "./teststepconnectorhaloitem";

export default class TestStepVariantHalo extends TestCaseHalo<TestStepVariantDefinition, TestStepVariantView> {
    createItems(): void {
        super.createItems();
        this.addItems(TestStepConnectorHaloItem);
    }
}
