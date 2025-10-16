import TestcaseFile from "../../../repository/serverfile/testcasefile";
import GraphicalModelDefinition from "../graphicalmodeldefinition";
import TestAnnotationDefinition from "./testannotation";
import TestPlanDefinition from "./testplandefinition";

export default class TestcaseModelDefinition extends GraphicalModelDefinition {
    testplan: TestPlanDefinition;
    annotations: TestAnnotationDefinition[] = [];

    /**
     * Imports an XML element and parses it into a in-memory definition structure.
     */
    constructor(public file: TestcaseFile) {
        super(file, file.fileName + '.dimensions');

        this.testplan = this.parseElement(TestPlanDefinition.XML_ELEMENT, TestPlanDefinition) ?? this.createDefinition(TestPlanDefinition);
        this.annotations = this.parseElements('textAnnotation', TestAnnotationDefinition);
    }

    createTextAnnotation(id?: string) {
        const annotation: TestAnnotationDefinition = super.createDefinition(TestAnnotationDefinition, undefined, id);
        this.annotations.push(annotation);
        return annotation;
    }

    toXML() {
        const xmlDocument = super.exportModel('testcase', 'testplan', 'annotations');
        return xmlDocument;
    }
}
