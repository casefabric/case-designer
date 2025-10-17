import $ from "jquery";
import AlpacaPreview from "../../../../editors/external/alpacapreview";
import TestStepVariantView from "../teststepvariantview";
import TestCaseProperties from "./testcaseproperties";

export default class TestStepVariantProperties extends TestCaseProperties<TestStepVariantView> {
    constructor(view: TestStepVariantView) {
        super(view);
    }

    renderData(): void {
        super.renderData();
        const typeSchema = this.view.parent.getVariantTypeSchema();

        if (typeSchema) {
            this.addJsonDataForm("Content", typeSchema, this.view.definition.content, (newContent) => {
                const newContentStr = JSON.stringify(newContent);
                this.view.updateContent(newContentStr);
            });
        }
    }

    addJsonDataForm(label: string, schema: any, data?: string, onChange?: (newContent: any) => void) {
        const currentContent = data ? JSON.parse(data) : {};
        const html = $(`<div class="propertyBlock" style="height: 500px; width=100%; overflow-y:auto; ">
                            <label>${label}</label>
                            <div class="json-variant-editor" border: 1px solid #ccc;"></div>
                        </div>`);
        this.htmlContainer.append(html);
        const jsonEditor = html.find('.json-variant-editor');

        const editor = new AlpacaPreview(jsonEditor, currentContent, onChange).render(schema);
    }
}
