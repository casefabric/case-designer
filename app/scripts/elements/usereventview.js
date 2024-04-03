class UserEvent extends EventListener {
    /**
     * 
     * @param {Stage} stage 
     * @param {*} x 
     * @param {*} y 
     */
    static create(stage, x, y) {
        const definition = stage.planItemDefinition.createPlanItem(UserEventDefinition);
        const shape = stage.case.diagram.createShape(x, y, 32, 32, definition.id);
        if (definition.definition instanceof UserEventDefinition) {
            return new UserEvent(stage, definition, definition.definition, shape);
        }
        console.error('Not supposed to reach this code');
    }

    /**
     * Creates a new UserEvent element.
     * @param {CMMNElement} parent 
     * @param {PlanItem} definition
     * @param {UserEventDefinition} planItemDefinition 
     * @param {ShapeDefinition} shape 
     */
    constructor(parent, definition, planItemDefinition, shape) {
        super(parent, definition, shape);
        this.planItemDefinition = planItemDefinition;
    }

    createProperties() {
        return new UserEventProperties(this);
    }

    get imageURL() {
        return 'images/svg/userevent.svg';
    }

    /**
     * validate: all steps to check this element
     */
    __validate() {
        super.__validate();

        // Authorized roles must be filled with an ID attribute.
        this.planItemDefinition.authorizedRoles.filter(r => !r.id).forEach(r => this.raiseValidationIssue(40));
    }

    referencesDefinitionElement(definitionId) {
        if (this.planItemDefinition.authorizedRoles.find(role => role.id == definitionId)) {
            return true;
        }
        return super.referencesDefinitionElement(definitionId);
    }
}
CMMNElement.registerType(UserEvent, 'User Event', 'images/svg/userevent.svg');
