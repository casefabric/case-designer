import $ from "jquery";
import ModelSelectorDialog from "../../../../editors/modelselectordialog";
import Images from "../../../../util/images/images";
import TaskView from "../taskview";
import TaskStageProperties from "./taskstageproperties";

export default class TaskProperties extends TaskStageProperties {
    /**
     * 
     * @param {TaskView} task 
     */
    constructor(task) {
        super(task);
        this.task = task;
    }

    /**
     * Adds a dropdown with all possible task implementation
     */
    addModelImplementation() {
        const repositoryBrowser = this.cmmnElement.case.editor.ide.repositoryBrowser;
        const taskDefinition = this.task.definition;
        const implementationFile = taskDefinition.implementationModel?.file;

        const html = $(`<div class="propertyBlock">
                            <label>Implementation</label>
                            <div class="modelselect">
                                <input style='cursor: text; pointer-events: none' disabled id="modelImplementation" type="text" value="${implementationFile ? implementationFile.name : ''}"></input>
                                <img id="zoomButton"src="${Images.ZoomIn}"></img>
                                <img id="removeButton"src="${Images.CloseBlack}"></img>
                            </div>
                            </div>
                        </div>`);
        html.find('.modelselect').on('click', e => {
            new ModelSelectorDialog(this.task.editor.ide, 'Select a model to be used as task implementation', this.task.implementationType, implementationFile, this.task.definition.modelDefinition)
                .showModalDialog(file /** @type {ServerFile<ModelDefinition>}*/ => {
                    if (file) {
                        this.task.changeTaskImplementation(file);
                    }
                });
        });
        html.find('#removeButton').on('click',
            e => {
                // if (confirm("Do you want to remove the mappings too?")) {
                //     console.log("Removing mappings too...")
                // }
                this.change(taskDefinition, 'implementationRef', '');
                this.clear();
                this.renderForm();
            });
        // Also make the html a drop target for drag/dropping elements from the repository browser
        html.on('pointerover', e => repositoryBrowser.setDropHandler(dragData => this.task.changeTaskImplementation(dragData.file), dragData => this.task.supportsFileTypeAsImplementation(dragData)));
        html.on('pointerout', e => repositoryBrowser.removeDropHandler());
        this.htmlContainer.append(html);
        return html;
    }

    addValidatorField() {
        const taskDefinition = this.task.definition;
        const implementation = taskDefinition.validatorRef ? taskDefinition.validatorRef : '';

        const options = this.case.editor.ide.repository.getProcesses().map(model => `<option value="${model.fileName}" ${model.fileName == implementation ? " selected" : ""}>${model.name}</option>`).join('');
        const html = $(`<div class="propertyBlock" title="Select a web service to be invoked to validate task output">
                            <label>Task Output Validator</label>
                            <div class="properties_filefield">
                                <div>
                                    <select>
                                        <option value="">${implementation ? '... remove ' + implementation : ''}</option>
                                        ${options}
                                    </select>
                                </div>
                            </div>
                        </div>`);
        html.find('select').on('change', e => {
            const reference = e.target.value;
            const model = this.task.getImplementationList().find(model => model.fileName == reference);
            if (model) {
                this.change(taskDefinition, 'validatorRef', e.target.value);
                this.clear();
                this.renderForm();
            } else {
                // if (confirm("Do you want to remove the mappings too?")) {
                //     console.log("Removing mappings too...")
                // }
                this.change(taskDefinition, 'validatorRef', e.target.value);
                this.clear();
                this.renderForm();
            }
        });
        this.htmlContainer.append(html);
        return html;
    }

    addParameterMappings() {
        const html = $(`<div class="propertyBlock">
            <button class="btnParameterMapping">Edit Parameter Mappings</button>
        </div>`);
        html.find('.btnParameterMapping').on('click', e => this.task.mappingsEditor.show());
        this.htmlContainer.append(html);
        return html;
    }

    addIsBlocking() {
        this.addCheckField('Is Blocking', 'If the task is non-blocking, the case will continue without awaiting the task to complete', Images.Blocking, 'isBlocking', this.task.definition);
    }

    renderData() {
        this.addNameField();
        this.addSeparator();
        this.addDocumentationField();
        this.addSeparator();
        this.addModelImplementation();
        this.addParameterMappings();
        this.addSeparator();
        this.addRepeatRuleBlock();
        this.addRequiredRuleBlock();
        this.addManualActivationRuleBlock();
        this.addSeparator();
        this.addIsBlocking();
        this.addDiscretionaryBlock(Images.DiscretionaryTask, 'Discretionary Task');
        this.addIdField();
    }
}
