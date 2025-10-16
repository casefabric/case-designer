import TestAnnotationDefinition from "../../../../../repository/definition/testcase/testannotation";
import TestAnnotationView from "../testannotationview";
import TestCaseHalo from "./testcasehalo";
import TestStepConnectorHaloItem from "./teststepconnectorhaloitem";

export default class TestTextAnnotationHalo extends TestCaseHalo<TestAnnotationDefinition, TestAnnotationView> {
    createItems(): void {
        super.createItems();
        this.leftBar.addItems(TestStepConnectorHaloItem);
    }
}
