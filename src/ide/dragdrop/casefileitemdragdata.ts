import CaseFileItemsEditor from "@ide/modeleditor/case/editors/casefileitemseditor";
import DragData from "./dragdata";
import CaseFileItemDef from "@repository/definition/cmmn/casefile/casefileitemdef";
import CaseFileItemView from "@ide/modeleditor/case/elements/casefileitemview";

export default class CaseFileItemDragData extends DragData {
    constructor(editor: CaseFileItemsEditor, public item: CaseFileItemDef) {
        super(editor, item.name, (CaseFileItemView as any).smallImage);
    }
}
