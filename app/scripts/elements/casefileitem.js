class CaseFileItem extends CMMNElement {
    /**
     * 
     * @param {Stage} stage 
     * @param {Number} x 
     * @param {Number} y 
     */
    static create(stage, x, y) {
        const shape = CaseFileItemShape.create(stage, x, y);
        return new CaseFileItem(stage, shape);
    }

    /**
     * Creates a new CaseFileItem
     * @param {Stage} parent 
     * @param {CaseFileItemShape} definition 
     */
    constructor(parent, definition) {
        super(parent, definition);
        this.definition = definition;
        this.cfiShape = definition;
        this.__resizable = false;
    }

    createProperties() {
        return new CaseFileItemProperties(this);
    }

    createHalo() {
        return new CaseFileItemHalo(this);
    }

    refreshReferencingFields(definitionElement) {
        super.refreshReferencingFields(definitionElement);
        if (this.cfiShape.contextRef == definitionElement.id) {
            this.refreshText();
        }
    }

    get cfi() {
        return this.case.caseDefinition.getElement(this.cfiShape.contextRef);
    }

    get text() {
        return this.cfi ? this.cfi.name : '';
    }

    /**
     * @returns {CMMNDocumentationDefinition}
     */
    get documentation() {
        return this.cfi && this.cfi.documentation;
    }

    get markup() {
        return `<g>
                    <polyline class="cmmn-shape cmmn-border cmmn-casefile-shape" points=" 15,0 0,0 0,40 25,40 25,10 15,0 15,10 25,10" />
                </g>
                <text class="cmmn-text" text-anchor="middle" x="10" y="55" />`;
    }

    //validate: all steps to check this element
    __validate() {
        if (!this.name) {
            const message = this.parent ? this.parent.name : '-no parent-';
            this.raiseValidationIssue(0, [message, this.case.name]);
        }
    }

    referencesDefinitionElement(definitionId) {
        return definitionId == this.cfiShape.contextRef;
    }
}
CMMNElement.registerType(CaseFileItem, 'Case File Item', 'images/svg/casefileitem.svg');