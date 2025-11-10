'use strict';

import $ from "jquery";
import ParameterDefinition from "../../../repository/definition/contract/parameterdefinition";
import Util from "../../../util/util";
import HtmlUtil from "../../util/htmlutil";
import ModelEditor from "../modeleditor";
import TypeSelector from "../type/editor/typeselector";

export default class ModelParameters {
    html: JQuery<HTMLElement>;
    parameters: ParameterDefinition[] = [];
    content: JQuery<HTMLElement>;
    /**
     * This object handles the input and output parameters of task model editor.
     * 
     */
    constructor(public editor: ModelEditor, public htmlContainer: JQuery<HTMLElement>, public label: string, public readonly?: boolean) {
        this.html = $(`<div class='modelparametertable'>
        <label>${this.label}</label>
        <div>
            <table>
                <colgroup>
                    <col class="modelparameterdeletebtcol"></col>
                    <col class="modelparameternamecol"></col>
                    <col class="modelparametertypecol"></col>
                    <col class="modelparameteridcol"></col>
                </colgroup>
                <thead>
                    <tr>
                        <th></th>
                        <th>Name</th>
                        <th>Type</th>
                        <th>ID</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        </div>
    </div>`);
        this.content = this.html.find('tbody');
        this.htmlContainer.append(this.html);
    }

    renderParameters(parameters: ParameterDefinition[]) {
        // First clean the old content
        HtmlUtil.clearHTML(this.html.find('tbody'));

        // Overwrite current parameter set with the new array
        this.parameters = parameters;

        // Now render the parameters
        this.parameters.forEach(parameter => this.addParameter(parameter));
        if (!this.readonly) {
            this.addParameter();
        }
    }

    addParameter(parameter?: ParameterDefinition) {
        if (parameter === undefined) {
            // create a new, empty parameter at the end of the table
            parameter = this.editor.file?.definition?.createDefinition(ParameterDefinition);
            if (!parameter) return;
            parameter.id = parameter.name = '';
            parameter.isNew = true;
        }
        return new ParameterEditor(this, parameter);
    }

    removeParameterEditor(editor: ParameterEditor) {
        const parameter = editor.parameter;
        if (parameter.isNew) {
            return;
        }
        Util.removeFromArray(this.parameters, parameter);
        editor.delete();
        this.editor.completeUserAction();
    }
}

class ParameterEditor {
    html: JQuery<HTMLElement>;
    constructor(private parent: ModelParameters, public parameter: ParameterDefinition) {
        this.html = $(`<tr>
            <td><button ${this.parent.readonly ? 'disabled' : ''} class="removeParameter"></button></td>
            <td><input ${this.parent.readonly ? 'disabled' : ''} class="inputParameterName modelparameternamecol" value="${parameter.name}" /></td>
            <td><select ${this.parent.readonly ? 'disabled' : ''} class="inputParameterType modelparametertypecol"></select></td>
            <td><input ${this.parent.readonly ? 'disabled' : ''} class="inputParameterId modelparameteridcol" readonly value="${parameter.id}" /></td>
        </tr>`);

        this.html.find('.removeParameter').on('click', e => parent.removeParameterEditor(this));

        new TypeSelector(this.parent.editor.ide.repository, this.html.find('.inputParameterType'), this.parameter.typeRef, (typeRef: string) => this.changeType(typeRef), true)

        this.html.find('.inputParameterName').on('change', (e: JQuery.ChangeEvent) => this.changeName(e.currentTarget.value));
        this.html.find('.inputParameterId').on('change', (e: JQuery.ChangeEvent) => this.changeId(e.currentTarget.value));
        // // Remove "readonly" upon dblclick; id's are typically generated because they must be unique across multiple models
        this.html.find('.inputParameterId').on('dblclick', e => $(e.currentTarget).removeAttr('readonly'));

        parent.content.append(this.html);
    }

    refreshParameterRow() {
        this.html.find('.inputParameterName').val(this.parameter.name);
        this.html.find('.inputParameterId').val(this.parameter.id);
        this.html.find('.inputParameterId').attr('readonly', 'true');
    }

    changeName(newName: string) {
        const oldName = this.parameter.name;
        this.parameter.name = newName;
        if (this.parameter.id.indexOf(oldName) >= 0) {
            if (!newName) {
                this.parameter.id = '';
            } else {
                this.parameter.id = this.parameter.id.replace(oldName, newName);
            }
        } else if (!this.parameter.id) {
            this.parameter.id = `${this.parameter.name.replace(/\s/g, '')}__${Util.createID('', 4)}`;
        }
        this.done();
    }

    changeType(newType: string) {
        this.parameter.typeRef = newType;
        this.done();
    }

    changeId(newId: string) {
        this.parameter.id = newId;
        this.done();
    }

    delete() {
        HtmlUtil.removeHTML(this.html);
    }

    done() {
        if (this.parameter.isNew) {
            // No longer transient parameter
            this.parameter.isNew = false;
            this.parent.parameters.push(this.parameter);
            this.parent.addParameter();
        }
        this.parent.editor.completeUserAction();
        this.refreshParameterRow();
    }
}
