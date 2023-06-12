
class Milestone extends PlanItemView {
    /**
     * 
     * @param {Stage} stage 
     * @param {*} x 
     * @param {*} y 
     */
    static create(stage, x, y) {
        const definition = stage.planItemDefinition.createPlanItem(MilestoneDefinition);
        const shape = stage.case.diagram.createShape(x, y, 100, 40, definition.id);
        if (definition.definition instanceof MilestoneDefinition) {
            return new Milestone(stage, definition, definition.definition, shape);
        }
        console.error('Not supposed to reach this code');
    }

    /**
     * Creates a new HumanTask element.
     * @param {CMMNElement} parent 
     * @param {PlanItem} definition
     * @param {MilestoneDefinition} planItemDefinition 
     * @param {ShapeDefinition} shape 
     */
    constructor(parent, definition, planItemDefinition, shape) {
        super(parent, definition, shape);
        this.planItemDefinition = planItemDefinition;
    }

    get wrapText() {
        return true;
    }

    createProperties() {
        return new MilestoneProperties(this);
    }

    get markup() {
        return `<g class="scalable">
                    <rect class="cmmn-shape cmmn-border cmmn-milestone-shape" rx="20" ry="20" width="100" height="40" />
                </g>
                <text class="cmmn-text" />
                ${this.decoratorBox}`;
    }

    get textAttributes() {
        return {
            'text': {
                ref: '.cmmn-shape',
                'ref-x': .5,
                'ref-y': .5,
                'y-alignment': 'middle',
                'x-alignment': 'middle'
            }
        };
    }

    createDecorators() {
        return [
            new Decorator(REQUIRED_IMG, () => this.definition.itemControl.requiredRule),
            new Decorator(REPETITION_IMG, () => this.definition.itemControl.repetitionRule)
        ];
    }

    /**
     * returns true when an element of type 'elementType' can be added as a child to this element
     * @param {String} elementType 
     */
    __canHaveAsChild(elementType) {
        return this.canHaveCriterion(elementType);
    }

    /**
     * 
     * @param {String} criterionType 
     * @returns 
     */
    canHaveCriterion(criterionType) {
        return criterionType == EntryCriterion.name;
    }
}
CMMNElement.registerType(Milestone, 'Milestone', 'images/svg/milestone.svg');
