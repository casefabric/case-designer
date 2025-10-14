import TestTaskStepView from "../testtaskstepview";
import TestStepProperties from "./teststepproperties";

export default class TestTaskStepProperties extends TestStepProperties<TestTaskStepView> {
    renderData(): void {
        super.renderData();

        const caseDefinition = this.view.definition.modelDefinition.testplan.testFixture?.caseDefinition;
        if (!caseDefinition) {
            return;
        }
        const humanTaskDefinitions = caseDefinition.elements.filter(element => element.constructor.name === 'HumanTaskDefinition');
        this.addSelectField("Task", humanTaskDefinitions.map(def => { return { value: def.id, label: def.name }; }),
            () => this.view.definition.taskDefinitionId,
            (newValue) => {
                this.view.definition.taskDefinitionId = newValue;
                this.view.canvas.editor.completeUserAction();
            }
        );
    }
}
