import $ from "jquery";
import CaseFile from "../../../../../repository/serverfile/casefile";
import ServerFileDragData from "../../../../dragdrop/serverfiledragdata";
import FixtureView from "../fixtureview";
import TestCaseProperties from "./testcaseproperties";

export default class FixtureProperties extends TestCaseProperties<FixtureView> {
    constructor(fixture: FixtureView) {
        super(fixture);
    }

    renderData() {
        this.addDocumentationField();
        this.addSeparator();

        this.addCaseSelector();
    }

    addCaseSelector() {
        const repositoryBrowser = this.view.canvas.editor.ide.repositoryBrowser;
        const fixtureDefinition = this.view.definition;
        const implementation = fixtureDefinition.caseRef ? fixtureDefinition.caseRef : '';

        const options = this.getAllCaseDefinitions().map(model =>
            `<option value="${model.fileName}" ${model.fileName == implementation ? " selected" : ""}>${model.name}</option>`
        ).join('');
        const html = $(`<div class="propertyBlock">
                            <label>Case</label>
                            <div class="properties_filefield">
                                <div>
                                    <select>
                                        <option value="">${implementation ? '... remove ' + implementation : ''}</option>
                                        ${options}
                                    </select>
                                </div>
                            </div>
                        </div>`);
        html.find('select').on('change', (e: JQuery.ChangeEvent) => {
            const reference = (e.target as HTMLSelectElement).value;
            const model = this.getAllCaseDefinitions().find(model => model.fileName == reference);
            this.view.changeCaseReference(model);
            this.clear();
            this.renderForm();
        });
        // Also make the html a drop target for drag/dropping elements from the repository browser
        html.on('pointerover', () =>
            repositoryBrowser.setDropHandler(
                (dragData: ServerFileDragData) => this.view.changeCaseReference(dragData.file),
                (dragData: ServerFileDragData) => dragData.file instanceof CaseFile
            )
        );
        html.on('pointerout', () => repositoryBrowser.removeDropHandler());
        this.htmlContainer.append(html);
        return html;
    }



    private getAllCaseDefinitions() {
        return this.view.canvas.editor.ide.repository.getCases();
    }
}
