import CaseFileItemDef from "../../../../../repository/definition/cmmn/casefile/casefileitemdef";
import CaseParameterDefinition from "../../../../../repository/definition/cmmn/contract/caseparameterdefinition";
import CMMNElementDefinition from "../../../../../repository/definition/cmmnelementdefinition";
import StandardForm from "../../../../editors/standardform";
import BottomSplitter from "../../../../splitter/bottomsplitter";
import CaseCanvas from "../../elements/casecanvas";
import ColumnRenderer from "../tableeditor/columnrenderer";
import RowRenderer from "../tableeditor/rowrenderer";
import TableRenderer from "../tableeditor/tablerenderer";
import CFIZoom from "./cfizoom";
import ExpressionChanger from "./expressionchanger";
import NameChanger from "./namechanger";
import ParameterDeleter from "./parameterdeleter";

export default class CaseParametersEditor extends StandardForm {
    /**
     * 
     * @param {CaseCanvas} cs 
     */
    constructor(cs) {
        super(cs, 'Edit case parameters', 'caseparameters');
    }

    renderHead() {
        super.renderHead();
        this.htmlContainer.html(
            `<div class="parameterscontainer">
    <div class="input parameters">
        <h4>Input Parameters</h4>
        <div class="parameterbox input-parameters"></div>
    </div>
    <div class="output parameters">
        <h4>Output Parameters</h4>
        <div class="parameterbox output-parameters"></div>
    </div>
</div>`);
        const inputMappingsContainer = this.htmlContainer.find('.input-parameters');
        this.inputParametersControl = new InputParametersControl(this, inputMappingsContainer);
        const outputMappingsContainer = this.htmlContainer.find('.output-parameters');
        this.outputParametersControl = new OutputParametersControl(this, outputMappingsContainer);
        this.splitter = new BottomSplitter(this.htmlContainer.find('.parameterscontainer'), 200, 100);
    }

    renderData() {
        this.inputParametersControl.renderTable();
        this.outputParametersControl.renderTable();
    }

    refresh() {
        if (this._html) {
            this.renderForm();
        }
    }
}

class ParametersControl extends TableRenderer {
    /**
     * Creates a table to render parameters
     * @param {CaseParametersEditor} editor 
     * @param {JQuery<HTMLElement>} htmlParent 
     */
    constructor(editor, htmlParent) {
        super(editor.canvas, htmlParent);
        this.editor = editor;
    }

    /**
     * @returns {Array<CaseParameterDefinition>} The task input parameters (for usage in the parameters editor)
     */
    get parameters() {
        return this.data;
    }

    refresh() {
        this.editor.refresh();
    }

    /**
     * 
     * @param {CaseParameterDefinition} parameter 
     */
    addRenderer(parameter = undefined) {
        return new ParameterRow(this, parameter);
    }
}

class InputParametersControl extends ParametersControl {
    constructor(editor, htmlParent) {
        super(editor, htmlParent);
    }

    get data() {
        return this.case.caseDefinition.input;
    }

    get columns() {
        return [
            new ColumnRenderer(ParameterDeleter),
            new ColumnRenderer(NameChanger),
            new ColumnRenderer(ExpressionChanger, 'The transformation that is executed while binding parameter to the case file item'),
            new ColumnRenderer(CFIZoom, 'The case file item that binds to the parameter.\nAn empty binding means the parameter will not be used.')
        ];
    }
}

class OutputParametersControl extends ParametersControl {
    constructor(editor, htmlParent) {
        super(editor, htmlParent);
    }

    get data() {
        return this.case.caseDefinition.output;
    }

    get columns() {
        return [
            new ColumnRenderer(ParameterDeleter),
            new ColumnRenderer(NameChanger),
            new ColumnRenderer(ExpressionChanger, 'The transformation that is executed while binding the case file item to the parameter'),
            new ColumnRenderer(CFIZoom, 'The case file item that is used to fill the output parameter.\nAn empty binding means the parameter will be filled with the outcome of the expression.')
        ];
    }
}

export class ParameterRow extends RowRenderer {
    /**
     * @param {ParametersControl} control
     * @param {CaseParameterDefinition} parameter
     */
    constructor(control, parameter = undefined) {
        super(control, parameter);
        this.control = control;
        this.parameterName = parameter ? parameter.name : '';
        this.expression = parameter && parameter.bindingRefinement ? parameter.bindingRefinement.body : '';
        this.bindingName = parameter ? parameter.bindingName : '';
    }


    get parameter() {
        // Just to have some typesafe reference
        return /** @type {CaseParameterDefinition} */ (this.element);
    }

    /**
     * 
     * @param {CaseFileItemDef} cfi 
     */
    changeBindingRef(cfi) {
        if (!this.parameterName) {
            this.parameter.bindingRef.update(cfi.id);
            this.parameterName = this.parameter.name = this.parameter.bindingName;
        }
        this.change('bindingRef', cfi.id);
        this.html.find('.cfiName').html(this.parameter.bindingName);
        this.html.find('.parameter-name').val(this.parameter.name);
    }

    /**
     * Name of the parameter
     * @param {String} newName 
     */
    changeName(newName) {
        if (this.parameter.bindingRef.isEmpty) {
            // try to find a matching case file item
            const caseFileItem = this.parameter.caseDefinition.caseFile.getDescendants().find(child => child.name === newName);
            if (caseFileItem) {
                this.parameter.bindingRef.update(caseFileItem.id);
                this.html.find('.cfiName').html(this.parameter.bindingName);
            }
        }
        super.change('name', newName);
    }

    /**
     * Refreshes the case file item label if we render it
     * @param {CMMNElementDefinition} cfi 
     */
    refreshReferencingFields(cfi) {
        super.refreshReferencingFields(cfi);
        if (!this.isEmpty() && this.parameter.bindingRef.references(cfi)) {
            this.html.find('.cfiName').html(cfi.name);
        }
    }

    /**
     * @returns {CaseParameterDefinition}
     */
    createElement() {
        return this.control.editor.canvas.caseDefinition.createDefinition(CaseParameterDefinition);
    }
}
