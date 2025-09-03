import $ from "jquery";
import Images from "../../../util/images/images";
import CaseView from "../elements/caseview";

export default class UndoRedoBox {
    private case: CaseView;
    private spanUndoCounter: JQuery<HTMLElement>;
    private spanRedoCounter: JQuery<HTMLElement>;

    /**
     * @param cs CaseView
     * @param html JQuery<HTMLElement>
     */
    constructor(cs: CaseView, public html: JQuery<HTMLElement>) {
        this.case = cs;
        this.html.append(
            $(`<div class="formheader">
    <div>
        <div class="undo" type="button" title="Undo">
            <span>${this.case.editor.undoManager.getUndoCount()}</span>
            <img src="${Images.Undo}" />
        </div>                
        <div class="redo" type="button" title="Redo">
            <img src="${Images.Redo}" />
            <span>${this.case.editor.undoManager.getRedoCount()}</span>
        </div>
    </div>
</div>`)
        );
        html.find('.undo').on('click', () => this.case.editor.undoManager.undo());
        html.find('.redo').on('click', () => this.case.editor.undoManager.redo());
        this.spanUndoCounter = html.find('.undo span');
        this.spanRedoCounter = html.find('.redo span');
    }

    refresh(): void {
        this.spanUndoCounter.html(`${this.case.editor.undoManager.getUndoCount()}`);
        this.spanRedoCounter.html(`${this.case.editor.undoManager.getRedoCount()}`);
    }
}
