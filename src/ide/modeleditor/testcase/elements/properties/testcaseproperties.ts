import TestcaseModelDefinition from "../../../../../repository/definition/testcase/testcasemodeldefinition";
import Properties from "../../../../editors/modelcanvas/properties";
import TestCaseElementView from "../testcaseelementview";

export default class TestCaseProperties<ViewT extends TestCaseElementView> extends Properties<TestcaseModelDefinition, ViewT> {
    constructor(view: ViewT) {
        super(view);
    }

    renderForm(): void {
        super.renderForm();
        this.addIdField();
    }
}
