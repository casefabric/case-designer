import $ from "jquery";
import CaseFileItemDef from "../../../../../repository/definition/cmmn/casefile/casefileitemdef";
import CaseFileItemTypeDefinition from "../../../../../repository/definition/cmmn/casefile/casefileitemtypedefinition";
import Dialog from "../../../../editors/dialog";
import Shapes from "../../../../util/images/shapes";
import CaseView from "../../elements/caseview";

export default class CFISelector extends Dialog {
    case: CaseView;
    selectedItem?: CaseFileItemDef;
    dataElement?: JQuery<HTMLElement>;
    constructor(cs: CaseView) {
        super(cs.editor.ide, 'Select a Case File Item');
        this.case = cs;
        this.selectedItem = undefined;
    }

    renderDialog(dialogHTML: JQuery<HTMLElement>) {
        const htmlDialog = $(`
            <form class="model-selector dialog-content">
                <div class="tree"></div>
            </form>
        `);
        dialogHTML.append(htmlDialog);
        this.dataElement = dialogHTML.find('.tree');
        this.case.caseDefinition.caseFile.children.forEach(cfi => this.renderCaseFileItem(cfi, this.dataElement!));
    }

    renderCaseFileItem(item: CaseFileItemDef, container: JQuery<HTMLElement>) {
        if (item instanceof CaseFileItemTypeDefinition) {
            // Only render complex properties, not the primitive children.
            if (item.property && !item.property.isComplexType) {
                return;
            }
        }
        const html = $(
            `<div>
            <div class='summary'>
                <img class="icon" src="${Shapes.CaseFileItem}" />
                ${item.name}
            </div>
            <div class="children-tree"></div>
        </div>`);
        container?.append(html);
        html.find('.summary').on('click', e => {
            this.dataElement!.find('.selected-model')?.removeClass('selected-model');
            this.selectedItem = item;
            $(e.target).addClass('selected-model');
        });
        html.find('.summary').on('dblclick', e => {
            this.ok();
        });
        const divChildren = html.find('.children-tree');
        item.children.forEach(cfi => this.renderCaseFileItem(cfi, divChildren));
    }

    ok() {
        super.closeModalDialog(this.selectedItem);
    }

    cancel() {
        super.closeModalDialog(undefined);
    }
}
