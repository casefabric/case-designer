import TestStepVariantDefinition from "../../../../../repository/definition/testcase/teststepvariantdefinition";
import ConnectorHaloItem from "../../../../editors/modelcanvas/halo/connectorhaloitem";
import TestStepVariantView from "../teststepvariantview";
import TestCaseHalo from "./testcasehalo";

export default class TestStepVariantHalo extends TestCaseHalo<TestStepVariantDefinition, TestStepVariantView> {
    createItems(): void {
        super.createItems();
        this.addItems(ConnectorHaloItem);
    }
}
