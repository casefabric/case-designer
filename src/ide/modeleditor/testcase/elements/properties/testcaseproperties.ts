import $ from "jquery";
import TestcaseModelDefinition from "../../../../../repository/definition/testcase/testcasemodeldefinition";
import AlpacaPreview from "../../../../editors/external/alpacapreview";
import Properties from "../../../../editors/modelcanvas/properties";
import TestCaseElementView from "../testcaseelementview";

export default class TestCaseProperties<ViewT extends TestCaseElementView> extends Properties<TestcaseModelDefinition, ViewT> {
    constructor(view: ViewT) {
        super(view);
    }

    renderForm(): void {
        super.renderForm();
        this.addIdField();
    }

    addJsonDataForm(label: string, schema: any, currentContent?: object, onChange?: (newContent: object) => void) {
        const html = $(`<div class="propertyBlock" style="height: 500px; width=100%; overflow-y:auto; ">
                            <label>${label}</label>
                            <div class="json-variant-editor" border: 1px solid #ccc;"></div>
                        </div>`);
        this.htmlContainer.append(html);
        const jsonEditor = html.find('.json-variant-editor');

        const editor = new AlpacaPreview(jsonEditor, currentContent, onChange).render(schema);
    }

    addSelectField(label: string, values: { value: string, label: string }[], getProperty: () => string, setProperty: (newValue: string) => void): JQuery<HTMLElement> {
        const definition = this.view.definition;
        const currentValue = getProperty();
        const description = '';

        const options = values.map(value =>
            `<option value="${value.value}" ${value.value == currentValue ? " selected" : ""}>${value.label}</option>`
        ).join('');
        const html = $(`<div class="propertyBlock" title="${description}">
                            <label>${label}</label>
                            <div class="properties_selectfield">
                                <div>
                                    <select>
                                        <!-- <option value="">${currentValue ? '... remove ' + currentValue : ''}</option> -->
                                        ${options}
                                    </select>
                                </div>
                            </div>
                        </div>`);
        html.find('select').on('change', (e: JQuery.ChangeEvent) => {
            const newValue = (e.target as HTMLSelectElement).value;
            setProperty(newValue);
            this.clear();
            this.renderForm();
        });
        this.htmlContainer.append(html);
        return html;
    }
}
