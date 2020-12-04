class CaseFileItemProperties extends Properties {
    /**
     * 
     * @param {CaseFileItem} caseFileItem 
     */
    constructor(caseFileItem) {
        super(caseFileItem);
        this.cmmnElement = caseFileItem;
    }

    renderData() {
        const caseFileItemId = this.cmmnElement.shape.cmmnElementRef ? this.cmmnElement.shape.cmmnElementRef : '';
        const cfi = this.cmmnElement.case.caseDefinition.getElement(caseFileItemId);
        const contextName = cfi ? cfi.name : '';


        const html = $(`<div class="zoomRow zoomDoubleRow" title="Drag/drop a case file item from the editor to change the reference">
                            <label class="zoomlabel">Case File Item</label>
                            <label class="valuelabel">${contextName}</label>
                            <button class="zoombt"></button>
                            <button class="removeReferenceButton" title="remove the reference to the case file item" />
                        </div>`);
        this.htmlContainer.append(html);
                        
        html.find('.zoombt').on('click', e => this.cmmnElement.case.cfiEditor.open(cfi => this.changeContextRef(html, cfi)));
        html.find('.removeReferenceButton').on('click', e => this.changeContextRef(html));
        html.on('pointerover', e => {
            e.stopPropagation();
            this.cmmnElement.case.cfiEditor.dropHandler = cfi => this.changeContextRef(html, cfi);
        });
        html.find('.zoomRow').on('pointerout', e => this.cmmnElement.case.cfiEditor.dropHandler = undefined);
        this.addDocumentationField();
        this.addIdField();
    }

    changeContextRef(html, cfi = undefined) {
        const cfiName = cfi ? cfi.name : '';
        const cfiId = cfi ? cfi.id : undefined;
        this.cmmnElement.setDefinition(cfi);
        html.find('.valuelabel').html(cfiName);
    }
}
