import ShapeDefinition from "../../../../repository/definition/dimensions/shape";
import DocumentableElementDefinition from "../../../../repository/definition/documentableelementdefinition";
import TestcaseModelDefinition from "../../../../repository/definition/testcase/testcasemodeldefinition";
import ElementView from "../../../editors/modelcanvas/elementview";
import TestCaseCanvas from "../testcasecanvas";

export default abstract class TestCaseElementView<ElemDefT extends DocumentableElementDefinition<TestcaseModelDefinition> = DocumentableElementDefinition<TestcaseModelDefinition>> extends ElementView<ElemDefT> {
    constructor(public canvas: TestCaseCanvas, public parent: TestCaseElementView | undefined, public definition: ElemDefT, public shape: ShapeDefinition) {
        super(canvas, parent, definition, shape);
    }
    get isStartStep() {
        return false;
    }
    get isVariant() {
        return false;
    }
    get isAssertion() {
        return false;
    }
    get isStep() {
        return false;
    }

}
