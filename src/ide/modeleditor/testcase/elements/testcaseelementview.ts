import DocumentableElementDefinition from "../../../../repository/definition/documentableelementdefinition";
import TestcaseModelDefinition from "../../../../repository/definition/testcase/testcasemodeldefinition";
import ElementView from "../../../editors/modelcanvas/elementview";

export default abstract class TestCaseElementView<ElemDefT extends DocumentableElementDefinition<TestcaseModelDefinition>> extends ElementView<ElemDefT> {
    get isVariant() {
        return false;
    }

}
