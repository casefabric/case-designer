import $ from "jquery";
import HumanTaskDefinition from "../../../../../repository/definition/cmmn/caseplan/task/humantaskdefinition";
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
        const taskDefinition = this.task.definition;

        const html = $(
            `<div class="propertyBlock">
                <label>Implementation</label>
                <model-selector-control 
                    modeltype="${this.task.implementationType}" 
                    sourcemodel="${this.task.definition.modelDefinition.id}" 
                    class="modelSelectorControl"></model-selector-control>
            </div>`);

        const selectorControl = html.find('.modelSelectorControl');
        selectorControl.val(taskDefinition.implementationModel?.file?.fileName || '');
        selectorControl.on('change', e => {
            const value = e.currentTarget.value;
            if (!value || value === '') {
                // if (confirm("Do you want to remove the mappings too?")) {
                //     console.log("Removing mappings too...")
                // }
                this.change(taskDefinition, 'implementationRef', '');
                this.clear();
                this.renderForm();
            } else {
                const file = window.ide.repository.get(value);
                this.task.changeTaskImplementation(file);
            }
        });

        this.htmlContainer.append(html);
    }

    addValidatorField() {
        /** @type{HumanTaskDefinition} */

        const taskDefinition = this.task.definition;
        if (!taskDefinition.workflow) {
            return;
        }

        const html = $(
            `<div class="propertyBlock">
                <label>Task output validator</label>
                <model-selector-control 
                    modeltype="process" 
                    sourcemodel="${this.task.definition.modelDefinition.id}" 
                    class="modelSelectorControl"></model-selector-control>
            </div>`);

        const selectorControl = html.find('.modelSelectorControl');
        selectorControl.val(taskDefinition.workflow.validatorRef.file?.fileName || '');
        selectorControl.on('change', e => {
            this.change(taskDefinition, 'validatorRef', e.currentTarget.value);
            this.clear();
            this.renderForm();
        });

        this.htmlContainer.append(html);
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
