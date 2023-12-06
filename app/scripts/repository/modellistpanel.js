class ModelListPanel {
    /**
     * 
     * @param {RepositoryBrowser} repositoryBrowser
     * @param {JQuery<HTMLElement>} accordion 
     * @param {ModelEditorMetadata} type 
     */
    constructor(repositoryBrowser, accordion, type) {
        this.accordion = accordion;
        this.repositoryBrowser = repositoryBrowser;
        this.ide = repositoryBrowser.ide;
        this.type = type;

        this.htmlPanel = $(
            `<h3 filetype="${type.modelType}" createMessage="Create ${type.description}">${type.description}</h3>
             <div class="file-list-${type.modelType}"></div>`);

        this.accordion.append(this.htmlPanel);
        this.accordion.accordion('refresh');
        this.container = this.accordion.find('.file-list-' + type.modelType);
    }

    /**
     * Re-creates the items in the accordion for this panel
     * 
     * @param {Array<ServerFile>} files 
     * @param {Function} shapeType 
     */
    setModelList(files, shapeType) {
        // First create a big HTML string with for each model an <a> element
        const urlPrefix = window.location.origin + '/#';

        // Clean current file list
        Util.clearHTML(this.container);

        files.forEach(file => {
            const shapeImg = shapeType.menuImage;
            const error = file.metadata && file.metadata.error;
            const usageTooltip = `Used in ${file.usage.length} other model${file.usage.length == 1 ? '' : 's'}\n${file.usage.length ? file.usage.map(e => '- ' + e.id).join('\n') : ''}`;
            const tooltip = error ? error : usageTooltip;
            const nameStyle = error ? 'style="color:red"' : '';
            const modelURL = urlPrefix + file.fileName;
            const html = $(`<div class="model-item" title="${tooltip}" fileName="${file.fileName}">
                                <img src="${shapeImg}" />
                                <a name="${file.name}" fileType="${file.fileType}" href="${modelURL}"><span ${nameStyle}>${file.name}</span></a>
                            </div>`);
            this.container.append(html);
            // Add event handler for dragging.
            html.on('pointerdown', e => {
                e.preventDefault();
                e.stopPropagation();
                this.repositoryBrowser.startDrag(file.name, shapeType.name, shapeImg, file.fileName);
            });
        });

        this.repositoryBrowser.refreshAccordionStatus();
    }
}
