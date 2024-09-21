import CaseFileItemsEditor from "@ide/modeleditor/case/editors/casefileitemseditor";
import DragData from "./dragdata";
import CaseFileItemDef from "@repository/definition/cmmn/casefile/casefileitemdef";
import CaseFileItemView from "@ide/modeleditor/case/elements/casefileitemview";

export default class CaseFileItemDragData extends DragData {
    constructor(editor: CaseFileItemsEditor, cfi: CaseFileItemDef) {
        super(editor.ide, editor, cfi.name, CaseFileItemView.name, (CaseFileItemView as any).smallImage, cfi.id);
        (this as any).item = cfi;
    }
}
