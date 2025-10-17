import TextAnnotationDefinition from "../../../../../repository/definition/testcase/textannotation";
import TextAnnotationView from "../textannotationview";
import TestCaseHalo from "./testcasehalo";
import TestStepConnectorHaloItem from "./teststepconnectorhaloitem";

export default class TestTextAnnotationHalo extends TestCaseHalo<TextAnnotationDefinition, TextAnnotationView> {
    createItems(): void {
        super.createItems();
        this.leftBar.addItems(TestStepConnectorHaloItem);
    }
}
