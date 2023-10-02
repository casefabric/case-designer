const DECORATORFROMBOTTOM = 4;
const DECORATORSIZE = 12;

class Decorator {
    /**
     * Simple helper class to visualize Decorator images on a PlanItem (like AutoComplete, RequiredRule, etc.)
     * @param {String} imgURL 
     * @param {Function} visibilityCondition 
     */
    constructor(imgURL, visibilityCondition) {
        this.imgURL = imgURL;
        this.visibilityEvaluator = visibilityCondition;
        this.id = Util.createID();
    }
}

class PlanItemView extends CMMNElement {
    /**
     * This is a generic class for plan item rendering; it takes default properties of the definition
     * It holds a reference both to the PlanItem definition AND to the PlanItemDefinition definition (e.g., HumanTask, Stage, Milestone).
     * @param {CMMNElement} parent 
     * @param {PlanItem} definition
     * @param {ShapeDefinition} shape 
     */
    constructor(parent, definition, shape) {
        super(parent, definition, shape);
        this.definition = definition;

        // Add the sentries
        this.definition.entryCriteria.forEach(criterion => this.addCriterion(criterion, EntryCriterion));
        this.definition.reactivateCriteria.forEach(criterion => this.addCriterion(criterion, ReactivateCriterion));
        this.definition.exitCriteria.forEach(criterion => this.addCriterion(criterion, ExitCriterion));
    }

    addCriterion(criterion, constructorFunction) {
        // If existing shape for criterion is not found, create a new shape.
        const shape = this.case.diagram.getShape(criterion) || this.case.diagram.createShape(this.shape.x - 6, this.shape.y + 10, 12, 20, criterion.id);
        const view = new constructorFunction(this, criterion, shape);
        this.__addCMMNChild(view);
    }

    set planItemDefinition(definition) {
        this.__pid = definition;
    }

    /** @returns {PlanItemDefinitionDefinition} */
    get planItemDefinition() {
        if (! this.__pid) {
            this.__pid =  this.definition.definition;
        }
        return this.__pid;        
    }

    createProperties() {
        return new PlanItemProperties(this);
    }

    createHalo() {
        return new PlanItemHalo(this);
    }

    __resize(w, h) {
        super.__resize(w, h);
        this.moveDecoratorsToMiddle();
        // reposition our sentries on the right and bottom
        this.__childElements.filter(child => child instanceof Sentry).forEach(sentry => {
            //get the current position of sentry (the centre)
            const sentryX = sentry.shape.x + sentry.shape.width / 2;
            const sentryY = sentry.shape.y + sentry.shape.height / 2;
            const middleOfSentry = g.point(sentryX, sentryY);
            //find the side of the parent the sentry is nearest to and re-position sentry,
            // but only if it is on the right or bottom side (because we're only resizing, not re-positioning)
            const nearestSide = this.xyz_joint.getBBox().sideNearestToPoint(middleOfSentry);
            if (nearestSide == 'right') {
                sentry.__moveConstraint(this.shape.x + this.shape.width, sentryY);
            } else if (nearestSide == 'bottom') {
                sentry.__moveConstraint(sentryX, this.shape.y + this.shape.height);
            }
        })
    }

    /**
     * shows the element properties as icons in the element
     */
    refreshView() {
        super.refreshView();
        this.decoratorImages.forEach(decoratorImage => {
            const visibility = decoratorImage.visibilityEvaluator() ? 'visible' : 'hidden';
            this.html.find('.'+decoratorImage.id).attr('visibility', visibility);
        })
    }

    get decoratorBox() {
        const images = this.decoratorImages.map((d, i) => `<image x="${(i * DECORATORSIZE)}" y="${this.decoratorsTop}" visibility="${d.visibilityEvaluator() ? 'visible' : 'hidden'}" width="${DECORATORSIZE}" height="${DECORATORSIZE}" class="${d.id}" xlink:href="${d.imgURL}" />`).join('\n');
        return `<g transform="translate(${this.decoratorsLeft})" class="decoratorBox">${images}</g>`;
    }

    /**
     * @returns {Array<Decorator>}
     */
    createDecorators() {
        return [];
    }

    /**
     * Returns the list of decorator images used in this item.
     * @returns {Array<Decorator>}
     */
    get decoratorImages() {
        if (!this._decorators) this._decorators = this.createDecorators();
        return this._decorators;
    }

    /**
     * Calculates the left position that the decoratorBox should move to in order for the images to render in the middle of the bottom of the element
     */
    get decoratorsLeft() {
        const decoratorBoxWidth = this.decoratorImages.length * DECORATORSIZE;
        const decoratorLeft = Math.round((this.shape.width - decoratorBoxWidth) / 2);
        return decoratorLeft;
    }

    /**
     * Calculates the top position that the images in the decoratorBox should have in order for the images to render in the middle of the bottom of the element
     */
    get decoratorsTop() {
        const imgHeight = DECORATORSIZE + DECORATORFROMBOTTOM;
        const decoratorBoxTop = this.shape.height - imgHeight;
        return decoratorBoxTop;
    }

    /**
     * Position the decorators after resize again in the middle of the element
     */
    moveDecoratorsToMiddle() {
        const decoratorBox = this.html.find('.decoratorBox');
        const decoratorImages = decoratorBox.find('image');
        //y position at bottom of element
        decoratorImages.attr('y', this.decoratorsTop)

        //x position in middle
        decoratorBox.attr('transform', 'translate(' + this.decoratorsLeft + ')');
    }

    createCMMNChild(cmmnType, x, y) {
        if (cmmnType == EntryCriterion) {
            return this.__addCMMNChild(EntryCriterion.create(this, x, y));
        } else if (cmmnType == ReactivateCriterion) {
            return this.__addCMMNChild(ReactivateCriterion.create(this, x, y));
        } else if (cmmnType == ExitCriterion) {
            return this.__addCMMNChild(ExitCriterion.create(this, x, y));
        } else {
            return super.createCMMNChild(cmmnType, x, y);
        }
    }

    ruleUsesDefinitionId(ruleName, definitionId) {
        return this.definition.planItemControl && this.definition.planItemControl[ruleName] && this.definition.planItemControl[ruleName].contextRef == definitionId;
    }

    referencesDefinitionElement(definitionId) {
        if (this.ruleUsesDefinitionId('repetitionRule', definitionId)) {
            return true;
        }
        if (this.ruleUsesDefinitionId('requiredRule', definitionId)) {
            return true;
        }
        if (this.ruleUsesDefinitionId('manualActivationRule', definitionId)) {
            return true;
        }
    }

    __validate() {
        super.__validate();

        // Plan items must have a name.
        if (!this.name) {
            this.raiseValidationIssue(0, [this.typeDescription, this.case.name]);
        }

        // Validate ItemControl rules
        const itemControl = this.definition.planItemControl;
        if (itemControl) {
            this.validateRule(itemControl.repetitionRule, 'repeat');
            this.validateRule(itemControl.requiredRule, 'required');
            this.validateRule(itemControl.manualActivationRule, 'manualactivation');
        }
    }

    /**
     * @param {ConstraintDefinition} rule 
     * @param {String} ruleType 
     */
    validateRule(rule, ruleType) {
        //the rule exists for this element and is used
        if (rule && !rule.body) {
            this.raiseValidationIssue(24, [this.name, this.case.name, ruleType, 'rule expression']);
        }

        if (rule && !rule.contextRef) {
            this.raiseValidationIssue(39, [this.name, this.case.name, ruleType, 'context (case file item)']);
        }
    }

}