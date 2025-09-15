import DocumentableElementDefinition from "../../../../../repository/definition/documentableelementdefinition";
import TestcaseModelDefinition from "../../../../../repository/definition/testcase/testcasemodeldefinition";
import Halo from "../../../../editors/modelcanvas/halo/halo";
import TestCaseElementView from "../testcaseelementview";

export default class TestCaseHalo<ElemDefT extends DocumentableElementDefinition<TestcaseModelDefinition> = DocumentableElementDefinition<TestcaseModelDefinition>,
    ViewT extends TestCaseElementView<ElemDefT> = TestCaseElementView<ElemDefT>>
    extends Halo<ElemDefT, ViewT> {
}
