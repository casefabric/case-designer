import CaseFileItemDef from "../../../../../../repository/definition/cmmn/casefile/casefileitemdef";
import BindingRefinementEditor from "../bindingrefinementeditor";
import MappingRow from "./mappingrow";

export default class MappingCFI {
    static get label() {
        return 'Case File Item';
    }

    static get width() {
        return '150px';
    }

    /**
     * 
     * @param {MappingRow} row 
     * @param {JQuery<HTMLTableCellElement>} column 
     */
    constructor(row, column) {
        const parameter = row.mapping.taskParameter;

        const currentExpression = parameter && parameter.hasUnusualBindingRefinement ? parameter.bindingRefinementExpression : '';
        const tooltipExpression = currentExpression ? ': ' + currentExpression : ' is not set.';

        const breTooltip = parameter && parameter.bindingRef.nonEmpty ? 'Open binding refinement editor\nCurrent expression' + tooltipExpression : 'Binding refinement can only be edited if a case file item is set on the task parameter';
        const bindingRefPresent = parameter && parameter.bindingRef.nonEmpty;
        const extraStyle = currentExpression ? 'binding-refinement-filled' : '';

        const zoomRow = column.html(
            `<div class="cfiZoom">
                <label class="cfiName">${parameter ? parameter.bindingName : ''}</label>
                <button class="zoombt" style="right:42px" title="Select case file item"></button>
                <button class="openBindingReferenceButton ${extraStyle}" ${!bindingRefPresent ? 'disabled="true"' : ''} title="${breTooltip}">L</button>
                <button class="removeReferenceButton" title="Remove the reference to the case file item." ></button>
            </div>`);

        //add events for drag and drop
        zoomRow.on('pointerover', e => row.editor.case.cfiEditor.setDropHandler(dragData => this.changeBindingRef(dragData.item, row)));
        zoomRow.on('pointerleave', e => row.editor.case.cfiEditor.removeDropHandler());
        zoomRow.find('.zoombt').on('click', e => row.case.cfiEditor.open(cfi => this.changeBindingRef(cfi, row)));
        zoomRow.find('.removeReferenceButton').on('click', e => {
            this.removeBindingRef(row);
        });
        zoomRow.find('.openBindingReferenceButton').on('click', e => {
            const bindingRefinementEditor = new BindingRefinementEditor(row);
            bindingRefinementEditor.show();
        });
    }

    /**
     * Remove the bindingRef from the task parameter (if one is available)
     * @param {MappingRow} row 
     */
    removeBindingRef(row) {
        if (row.mapping.taskParameter) {
            row.mapping.updateBindingRef(undefined);
            row.control.refresh(); // This will also refresh the task parameters editor, and hence this zoom field
            //update the column UsedIn in the case file items treetable
            row.control.task.case.cfiEditor.showUsedIn();
            row.case.editor.completeUserAction();
        }
    }

    /**
     * Changing the binding ref also sets the new binding.
     * Passing undefined will delete the existing bindingRef.
     * @param {CaseFileItemDef} newBinding 
     * @param {MappingRow} row
     */
    changeBindingRef(newBinding, row) {
        row.mapping.updateBindingRef(newBinding);
        row.control.refresh(); // This will also refresh the task parameters editor, and hence this zoom field
        //update the column UsedIn in the case file items treetable
        row.control.task.case.cfiEditor.showUsedIn();
        row.case.editor.completeUserAction();
    }
}
