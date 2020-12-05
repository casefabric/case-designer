class ProcessTask extends Task {
    /**
     * 
     * @param {Stage} stage 
     * @param {*} x 
     * @param {*} y 
     */
    static create(stage, x, y) {
        const definition = stage.planItemDefinition.createPlanItem(ProcessTaskDefinition);
        const shape = stage.case.dimensions.createShape(x, y, 140, 80, definition.id);
        if (definition.definition instanceof ProcessTaskDefinition) {
            return new ProcessTask(stage, definition, definition.definition, shape);
        }
        console.error('Not supposed to reach this code');
    }

    /**
     * Creates a new ProcessTask element.
     * @param {CMMNElement} parent 
     * @param {PlanItem} definition
     * @param {ProcessTaskDefinition} planItemDefinition 
     * @param {ShapeDefinition} shape 
     */
    constructor(parent, definition, planItemDefinition, shape) {
        super(parent, definition, planItemDefinition, shape);
        this.planItemDefinition = planItemDefinition;
    }

    getImplementationList() {
        return ide.repository.getProcesses();
    }

    /**
     * Returns the element type image for this task
     */
    get imageURL() {
        return 'images/svg/processtask.svg';
    }

    get fileType() {
        return 'process';
    }
}
CMMNElement.registerType(ProcessTask, 'Process Task', 'images/svg/processtaskmenu.svg', 'images/processtaskmenu_32.png');
