import TestAnnotationView from "../testannotationview";
import TestCaseProperties from "./testcaseproperties";

export default class TestAnnotationProperties extends TestCaseProperties<TestAnnotationView> {
    constructor(textAnnotation: TestAnnotationView) {
        super(textAnnotation);
    }

    renderData() {
        this.addTextField('Text', 'text');
    }
}
