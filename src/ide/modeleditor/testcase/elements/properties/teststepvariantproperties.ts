import TestStepVariantView from "../teststepvariantview";
import TestCaseProperties from "./testcaseproperties";

export default class TestStepVariantProperties extends TestCaseProperties<TestStepVariantView> {

    renderData(): void {
        super.renderData();
        const typeSchema = this.view.parent.getVariantTypeSchema();

        if (typeSchema) {
            this.addJsonDataForm("Content", typeSchema, this.view.definition.content, (newContent) => {
                this.view.updateContent(newContent);
            });
        }
    }
}
