import TestcaseFile from "../../../repository/serverfile/testcasefile";
import GraphicalModelDefinition from "../graphicalmodeldefinition";
import TestPlanDefinition from "./testplandefinition";

export default class TestcaseModelDefinition extends GraphicalModelDefinition {
    testplan: TestPlanDefinition;

    /**
     * Imports an XML element and parses it into a in-memory definition structure.
     */
    constructor(public file: TestcaseFile) {
        super(file, file.fileName + '.dimensions');

        this.testplan = this.parseElement(TestPlanDefinition.XML_ELEMENT, TestPlanDefinition) ?? this.createDefinition(TestPlanDefinition);
    }

    toXML() {
        const xmlDocument = super.exportModel('testcase', TestPlanDefinition.XML_ELEMENT);
        return xmlDocument;
    }
}
