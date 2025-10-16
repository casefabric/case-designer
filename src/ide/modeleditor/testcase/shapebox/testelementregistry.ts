import ElementRegistry from "../../../editors/modelcanvas/shapebox/elementregistry";
import Images from "../../../util/images/images";
import Shapes from "../../../util/images/shapes";
import FixtureView from "../elements/fixtureview";
import TestAnnotationView from "../elements/testannotationview";
import TestStepAssertionsView from "../elements/testassertionsview";
import TestFileStepView from "../elements/testfilestepview";
import TestFinishStepView from "../elements/testfinishview";
import TestStartStepView from "../elements/teststartstepview";
import TestStepVariantView from "../elements/teststepvariantview";
import TestImages from "../testimages";


export default class TestElementRegistry extends ElementRegistry {
    constructor() {
        super();

        this.registerType(FixtureView, 'Fixture', Images.ProcessTask);
        this.registerType(TestStartStepView, 'Start', TestImages.Start);
        this.registerType(TestFileStepView, 'File', TestImages.File);
        this.registerType(TestFinishStepView, 'Finish', TestImages.Finish);
        this.registerType(TestStepVariantView, 'Variant', TestImages.Variant);
        this.registerType(TestStepAssertionsView, 'Assertions');
        this.registerType(TestAnnotationView, 'Text Annotation', Shapes.TextAnnotation);
    }
}
