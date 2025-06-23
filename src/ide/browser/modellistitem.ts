import $ from "jquery";
import ServerFile from "../../repository/serverfile/serverfile";
import Util from "../../util/util";
import HtmlUtil from "../util/htmlutil";
import Images from "../util/images/images";
import ModelListPanel from "./modellistpanel";

export default class ModelListItem {
    public readonly html: JQuery<HTMLElement>;
    constructor(public panel: ModelListPanel, public file: ServerFile, private predecessor?: ModelListItem) {
        this.panel.items.push(this);
        const urlPrefix = window.location.origin + window.location.pathname + '#';
        const error = file.metadata.error;
        const tooltip = error ? error : '';
        const nameStyle = error ? 'style="color:red"' : '';
        const modelURL = urlPrefix + file.fileName;
        const optionalDeployIcon = this.panel.type.supportsDeploy ? `<img class="action-icon deploy-icon" src="${Images.Deploy}" action="deploy" title="Deploy ${file.name} ..."/>` : '';
        const html = $(`<div class="model-item" title="${tooltip}" fileName="${file.fileName}">
                            <img class="menu-icon" src="${this.panel.type.icon}" />
                            <a name="${file.name}" fileType="${file.fileType}" href="${modelURL}"><span ${nameStyle}>${file.name}</span></a>
                            <img class="action-icon delete-icon" src="${Images.Delete}" action="delete" title="Delete model ..."/>
                            <img class="action-icon rename-icon" src="${Images.Rename}" action="rename" title="Rename model ..."/>
                            ${optionalDeployIcon}
                        </div>`);

        // Add event handler for rename, delete, and deploy.
        html.find('.delete-icon').on('click', async e => await panel.repositoryBrowser.delete(file));
        html.find('.rename-icon').on('click', async e => await panel.repositoryBrowser.rename(file));
        html.find('.deploy-icon').on('click', e => window.location.hash = file.fileName + '?deploy=true');
        // Add event handler for dragging the model.
        html.on('pointerdown', e => {
            e.preventDefault();
            e.stopPropagation();
            panel.repositoryBrowser.startDrag(file, panel.type.icon);
        });
        // Render tooltip on demand only, otherwise creating the tooltip will be slow
        html.on('mouseenter', e => this.html.attr('title', this.renderTooltip()));

        this.html = html;
    }

    refresh() {
        if (this.file.metadata.error) {
            this.html.find('span').css('color', 'red');
        } else {
            this.html.find('span').css('color', '');
        }
    }

    renderTooltip(): string {
        if (this.file.metadata.error) {
            return this.file.metadata.error;
        } else {
            const usageTooltip = `${this.file.name} used in ${this.file.usage.length} other model${this.file.usage.length == 1 ? '' : 's'}\n${this.file.usage.length ? this.file.usage.map(u => '- ' + u.fileName).join('\n') : ''}`;
            return usageTooltip;
        }
    }

    removeItem() {
        HtmlUtil.removeHTML(this.html);
        Util.removeFromArray(this.panel.items, this);
    }
}
