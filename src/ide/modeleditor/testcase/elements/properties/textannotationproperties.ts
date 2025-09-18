import TextAnnotationView from "../textannotationview";
import TextCaseProperties from "./testcaseproperties";

export default class TextAnnotationProperties extends TextCaseProperties<TextAnnotationView> {
    constructor(textAnnotation: TextAnnotationView) {
        super(textAnnotation);
    }

    renderData() {
        this.addTextField('Text', 'text');
    }
}
