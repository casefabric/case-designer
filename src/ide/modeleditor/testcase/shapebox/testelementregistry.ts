import ElementRegistry from "../../../editors/modelcanvas/shapebox/elementregistry";
import Images from "../../../util/images/images";
import FixtureView from "../elements/fixtureview";
import TestStartStepView from "../elements/teststartstepview";
import TestImages from "../testimages";


export default class TestElementRegistry extends ElementRegistry {
    constructor() {
        super();

        this.registerType(FixtureView, 'Fixture', Images.ProcessTask, Images.ProcessTask);
        this.registerType(TestStartStepView, 'Start', TestImages.Start, TestImages.Start);
    }
}
