import TestcaseFile from "../../../repository/serverfile/testcasefile";
import GraphicalModelDefinition from "../graphicalmodeldefinition";
import TestPlanDefinition from "./testplandefinition";
import TextAnnotationDefinition from "./textannotation";

export default class TestcaseModelDefinition extends GraphicalModelDefinition {
    testplan: TestPlanDefinition;
    annotations: TextAnnotationDefinition[] = [];

    /**
     * Imports an XML element and parses it into a in-memory definition structure.
     */
    constructor(public file: TestcaseFile) {
        super(file, file.fileName + '.dimensions');

        this.testplan = this.parseElement(TestPlanDefinition.XML_ELEMENT, TestPlanDefinition) ?? this.createDefinition(TestPlanDefinition);
        this.annotations = this.parseElements('textAnnotation', TextAnnotationDefinition);
    }

    createTextAnnotation(id?: string) {
        const annotation: TextAnnotationDefinition = super.createDefinition(TextAnnotationDefinition, undefined, id);
        this.annotations.push(annotation);
        return annotation;
    }

    toXML() {
        const xmlDocument = super.exportModel('testcase', 'testplan', 'annotations');
        return xmlDocument;
    }
}
