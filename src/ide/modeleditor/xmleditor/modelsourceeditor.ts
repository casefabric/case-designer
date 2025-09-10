﻿'use strict';

import XML from "../../../util/xml";
import CodeMirrorConfig from "../../editors/external/codemirrorconfig";
import ModelEditor from "../modeleditor";
import TypeEditor from "../type/editor/typeeditor";

export default class ModelSourceEditor {
    private _changed: boolean = false;
    private _codeMirrorEditor: any;

    constructor(public html: JQuery<HTMLElement>, public editor: ModelEditor | TypeEditor) {
        // Add the code mirror object to the model-container
        this._codeMirrorEditor = CodeMirrorConfig.createXMLEditor(this.html);

        // Code Mirror generates to many change events, we
        // handle them only upon blur, and keep track of changes in _changed flag
        this._codeMirrorEditor.on('focus', () => this._changed = true);
        this._codeMirrorEditor.on('blur', () => this.importSource());
        this._codeMirrorEditor.on('change', () => this._changed = true);
    }

    render(source: string) {
        this._codeMirrorEditor.setValue(source);
        //this refresh, is a workaround for defect in codemirror
        //not rendered properly when html is hidden
        // setTimeout(() => this._codeMirrorEditor.refresh(), 100);
        this._codeMirrorEditor.refresh();
    }

    /**
     * handle the change of all fields, create the xml and save
     */
    importSource() {
        if (this._changed == true) {
            const newSource = this._codeMirrorEditor.getValue();
            const data = XML.loadXMLString(newSource);
            if (XML.hasParseErrors(data)) {
                this.editor.ide.warning('Source does not contain valid XML and will not be imported', 2000);
                //not valid xml in the source editor, source tab must remain open
                // setTimeout(() => this.editor.html.find('.model-source-tabs').tabs('option', 'active', 1), 100);
                return;
            }
            setTimeout(async () => await this.editor.loadSource(newSource));
        }
    }
}
