import { Editor } from "codemirror";
import $ from "jquery";
import Tags from "../../../../repository/definition/tags";
import XML from "../../../../util/xml";
import CodeMirrorConfig from "../../../editors/external/codemirrorconfig";
import HtmlUtil from "../../../util/htmlutil";
import CaseModelEditor from "../casemodeleditor";

export default class CaseSourceEditor {
    html: JQuery<HTMLElement>;
    codeMirrorCaseXML: Editor;
    codeMirrorDimensionsXML: Editor;
    constructor(public editor: CaseModelEditor, public parentHTML: JQuery<HTMLElement>) {
        this.html = $(`<div class="case-source-editor">
    <div class="sourcecontainer">
        <div class="left">
            <h4>Source</h4>
            <div class="codemirrorsource"></div>
        </div>
        <div class="right">
            <h4>Visualization (dimensions)</h4>
            <div class="codemirrorsource"></div>
        </div>
    </div>
    <div class="sourcefooter">
        <button class="btnImport btn btn-default">Import</button>
        <button class="btnClose btn btn-default">Close</button>
    </div>
</div>`);
        parentHTML.append(this.html);


        this.html.find('.btnImport').on('click', e => this.import());
        this.html.find('.btnClose').on('click', () => this.close());

        this.codeMirrorCaseXML = CodeMirrorConfig.createXMLEditor(this.html.find('.left .codemirrorsource'));
        this.codeMirrorDimensionsXML = CodeMirrorConfig.createXMLEditor(this.html.find('.right .codemirrorsource'));
    }

    async import() {
        const newSource = this.codeMirrorCaseXML.getValue();
        const newDimensions = this.codeMirrorDimensionsXML.getValue();

        const caseXML = XML.loadXMLString(newSource);
        if (XML.hasParseErrors(caseXML)) {
            this.editor.ide.danger('Cannot import because definition does not contain proper XML', 3000);
            return;
        }

        const dimensionsXML = XML.loadXMLString(newDimensions);
        if (XML.hasParseErrors(dimensionsXML)) {
            this.editor.ide.danger('Cannot import because dimensions does not contain proper XML', 3000);
            return;
        }

        if (!XML.getChildByTagName(caseXML, 'case')) {
            this.editor.ide.danger('Cannot import because definition does not contain a root &lt;case&gt; tag', 3000);
            return;
        };

        if (!XML.getChildByTagName(dimensionsXML, Tags.CMMNDI)) {
            this.editor.ide.danger(`Cannot import because definition does not contain a root &lt;${Tags.CMMNDI}&gt; tag`, 3000);
            return;
        };

        if (!dimensionsXML.getElementsByTagName(Tags.CMMNDIAGRAM).length) {
            this.editor.ide.danger(`Cannot import because definition does not contain a &lt;${Tags.CMMNDIAGRAM}&gt; tag`, 3000);
            return;
        };

        // TODO add more checks for validity?

        // Now replace the content in the editor, and reload
        this.editor.caseFile.source = caseXML;
        this.editor.dimensionsFile!.source = dimensionsXML;
        this.editor.dimensionsFile!.parse();
        this.editor.caseFile.parse();
        // Load the new model in the editor, and save it.
        this.editor.loadDefinition();
        // Completing the action will save the model and add a corresponding action to the undo/redo buffer
        this.editor.completeUserAction();
        this.close();
    }

    close() {
        this.html.css('display', 'none');
    }

    get visible() {
        return this.html.css('display') == 'block';
    }

    open() {
        this.html.css('display', 'block');
        const caseXML = this.editor.canvas!.caseDefinition.toXMLString();
        const dimensionsXML = this.editor.canvas!.dimensions!.toXMLString();
        this.codeMirrorCaseXML.setValue(caseXML);
        this.codeMirrorDimensionsXML.setValue(dimensionsXML);
    }

    delete() {
        // Delete the generic events of the editor (e.g. click add button, ...)
        HtmlUtil.removeHTML(this.html);
    }
}
