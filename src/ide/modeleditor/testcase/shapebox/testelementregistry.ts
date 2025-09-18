import ElementRegistry from "../../../editors/modelcanvas/shapebox/elementregistry";
import Images from "../../../util/images/images";
import Shapes from "../../../util/images/shapes";
import FixtureView from "../elements/fixtureview";
import TestStepAssertionsView from "../elements/testassertionsview";
import TestFileStepView from "../elements/testfilestepview";
import TestFinishStepView from "../elements/testfinishview";
import TestStartStepView from "../elements/teststartstepview";
import TestStepVariantView from "../elements/teststepvariantview";
import TextAnnotationView from "../elements/textannotationview";
import TestImages from "../testimages";


export default class TestElementRegistry extends ElementRegistry {
    constructor() {
        super();

        this.registerType(FixtureView, 'Fixture', Images.Test);
        this.registerType(TestStartStepView, 'Start', TestImages.Start);
        this.registerType(TestFileStepView, 'File', TestImages.File);
        this.registerType(TestFinishStepView, 'Finish', TestImages.Finish);
        this.registerType(TestStepVariantView, 'Variant', TestImages.Variant);
        this.registerType(TestStepAssertionsView, 'Assertions');
        this.registerType(TextAnnotationView, 'Text Annotation', Shapes.TextAnnotation);
    }
}
