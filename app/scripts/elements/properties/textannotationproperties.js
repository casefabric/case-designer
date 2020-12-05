class TextAnnotationProperties extends Properties {
    /**
     * 
     * @param {TextAnnotation} textAnnotation 
     */
    constructor(textAnnotation) {
        super(textAnnotation);
        this.cmmnElement = textAnnotation;
    }

    renderData() {
        this.addTextField('Text', 'text');
        this.addIdField();
    }
}