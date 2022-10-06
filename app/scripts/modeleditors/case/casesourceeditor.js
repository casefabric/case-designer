class CaseSourceEditor {
    /**
     * 
     * @param {CaseModelEditor} editor 
     * @param {JQuery<HTMLElement>} parentHTML 
     */
    constructor(editor, parentHTML) {
        this.editor = editor;
        this.parentHTML = parentHTML;
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

    import() {
        const newSource = this.codeMirrorCaseXML.getValue();
        const newDimensions = this.codeMirrorDimensionsXML.getValue();

        const caseModelDocument = new CaseModelDocument(this.editor.ide, this.editor.fileName, newSource);
        const dimensionModelDocument = new DimensionsModelDocument(this.editor.ide, this.editor.dimensionsFileName, newDimensions);

        if (! caseModelDocument.xml) {
            this.editor.ide.danger('Cannot import because definition does not contain proper XML');
            return;
        }

        if (! caseModelDocument.xml || !XML.getChildByTagName(caseModelDocument.xml, 'case')) {
            this.editor.ide.danger('Cannot import because definition does not contain a root &lt;case&gt; tag');
            return;
        };

        if (! dimensionModelDocument.xml || !dimensionModelDocument.xml.getElementsByTagName(CMMNDIAGRAM).length) {
            this.editor.ide.danger('The node &lt;' + CMMNDIAGRAM + '&gt; could not be found in the dimensions document');
            return;
        };

        const caseDefinition = caseModelDocument.createInstance();
        const dimensions = dimensionModelDocument.createInstance();

        // TODO add more checks for validity?

        this.editor.loadDefinition(caseDefinition, dimensions);
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
        const caseXML = XML.prettyPrint(this.editor.case.caseDefinition.toXML());
        const dimensionsXML = XML.prettyPrint(this.editor.case.dimensions.toXML());
        this.codeMirrorCaseXML.setValue(caseXML);
        this.codeMirrorDimensionsXML.setValue(dimensionsXML);
    }

    delete() {
        // Delete the generic events of the editor (e.g. click add button, ...)
        Util.removeHTML(this.html);
    }
}