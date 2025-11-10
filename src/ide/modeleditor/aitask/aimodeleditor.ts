'use strict';

import $ from "jquery";
import AIModelDefinition from "../../../repository/definition/ai/aimodeldefinition";
import AIFile from "../../../repository/serverfile/aifile";
import XML from "../../../util/xml";
import IDE from "../../ide";
import ModelEditor from "../modeleditor";
import ModelEditorMetadata from "../modeleditormetadata";
import ModelParameters from "../xmleditor/modelparameters";
import ModelSourceEditor from "../xmleditor/modelsourceeditor";
import AIModelEditorMetadata from "./aitaskmodeleditormetadata";

export default class AIModelEditor extends ModelEditor {
    inputParametersControl?: ModelParameters;
    outputParametersControl?: ModelParameters;
    viewSourceEditor?: ModelSourceEditor;
    private _changed: any;
    private _currentAutoSaveTimer?: number;
    private _model?: AIModelDefinition;

    static register() {
        ModelEditorMetadata.registerEditorType(new AIModelEditorMetadata());
    }

    /** 
     * This editor handles process models; only validates the xml
     */
    constructor(ide: IDE, public file: AIFile) {
        super(ide, file);
    }

    get label() {
        return 'Edit AI - ' + this.fileName;
    }

    /**
     * adds the html of the entire page
     */
    generateHTML() {

        const html = $(`
            <div class="basicbox model-source-tabs">
                <ul>
                    <li><a href="#modelEditor">Editor</a></li>
                    <li><a href="#sourceEditor">Source</a></li>
                </ul>
                <div class="ai-model-editor" id="modelEditor">
                    <div class="modelgenericfields">
                        <div>
                            <label>Name</label>
                            <label>Documentation</label>
                        </div>
                        <div>
                            <input class="inputName" type="text" disabled />
                            <input class="inputDocumentation" type="text" />
                        </div>
                    </div>
                    <div class="model-parameters">
                        <div class="model-input-parameters"></div>
                        <div class="model-output-parameters"></div>
                    </div>
                    <div class="ai-model-source">
                        <label>Response &nbsp;&nbsp;</label>
                        <input class="responseclass" disabled></input>
                    </div>
                </div>
                <div class="model-source-editor" id="sourceEditor"></div>
            </div>
        `);

        this.renderAgent();

        this.htmlContainer.append(html);

        //add change event to input fields
        this.htmlContainer.find('.inputName').on('change', (e: any) => this.changeName(e.currentTarget.value));
        this.htmlContainer.find('.inputDocumentation').on('change', (e: any) => this.changeDescription(e.currentTarget.value));

        // Render input parameters
        this.inputParametersControl = new ModelParameters(this, this.html.find('.model-input-parameters'), 'Input Parameters', true);
        this.outputParametersControl = new ModelParameters(this, this.html.find('.model-output-parameters'), 'Output Parameters', true);

        //add the tab control
        this.htmlContainer.find('.model-source-tabs').tabs({
            activate: (e: any, ui: any) => {
                if (ui.newPanel.hasClass('model-source-editor')) {
                    this.viewSourceEditor?.render(this.model?.toXMLString() || '');
                }
            }
        });

        //add the source part
        this.viewSourceEditor = new ModelSourceEditor(this.html.find('.model-source-tabs .model-source-editor'), this);
    }

    onEscapeKey(e: JQuery.KeyDownEvent) {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
            return;
        }
        this.close();
    }

    changeName(newName: string) {
        if (this.model) {
            this.model.name = newName;
            this.saveModel();
        }
    }

    changeDescription(newDescription: string) {
        if (this.model) {
            this.model.documentation.text = newDescription;
            this.saveModel();
        }
    }

    render() {
        if (!this.model) return;

        if (!this.inputParametersControl) {
            this.generateHTML();
        }

        // Render name, description and implementationType
        this.htmlContainer.find('.inputName').val(this.model.name);
        this.htmlContainer.find('.inputDocumentation').val(this.model.documentation.text);
        this.renderAgent();
        this.inputParametersControl?.renderParameters(this.model.inputParameters);
        this.outputParametersControl?.renderParameters(this.model.outputParameters);

    }

    renderAgent() {
        if (!this.model) return;

        const modelImplementationDocument = XML.loadXMLString(this.model.implementation.xml).documentElement ?? (() => { throw new Error('No ownerDocument found'); })();

        const responseNode = XML.getChildByTagName(modelImplementationDocument, "response");
        const responseClass = this.htmlContainer.find('.responseclass');
        responseClass.val(responseNode?.textContent || '');
    }

    completeUserAction() {
        this.saveModel();
    }

    onShow() {
        //always start with editor tab
        this.html.find('.model-source-tabs').tabs('option', 'active', 0);
    }

    loadModel() {
        this._model = this.file.definition;
        this.render();
        this.visible = true;
    }

    /**
     * handle the change of the source (in 2nd tab)
     */
    async loadSource(newSource: any) {
        this.file.source = newSource;
        this.file.parse();
        this.loadModel();
        await this.saveModel();
    }

    async saveModel() {
        // Remove 'changed' flag just prior to saving
        this._changed = false;
        this.file.source = this.model?.toXML();
        await this.file.save();
    }

    get model() {
        return this._model;
    }
}
