class TextAnnotation extends CMMNElement {
    /**
     * 
     * @param {Stage} stage 
     * @param {Number} x 
     * @param {Number} y 
     */
    static create(stage, x, y) {
        const textAnnotationDefinition = stage.planItemDefinition.createTextAnnotation();
        textAnnotationDefinition.__startPosition = { x, y };
        return new TextAnnotation(stage, textAnnotationDefinition);
    }

    /**
     * Creates a new TextAnnotation element
     * @param {Stage} parent 
     * @param {TextAnnotationDefinition} definition 
     */
    constructor(parent, definition) {
        super(parent, definition);
        this.definition = definition;
    }

    get text() {
        return this.definition.text;
    }

    get wrapText() {
        return true;
    }

    createProperties() {
        return new TextAnnotationProperties(this);
    }

    get markup() {
        return `<g class="scalable">
                    <rect class="cmmn-shape cmmn-border cmmn-textannotation-shape" rx="5" ry="5" />
                </g>
                <text class="cmmn-text" />`;
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
}
CMMNElement.registerType(TextAnnotation, 'Text Annotation', 'images/svg/textannotation.svg');
