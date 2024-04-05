class TextAnnotationProperties extends Properties {
    /**
     * 
     * @param {TextAnnotationView} textAnnotation 
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