import "@styles/ide/modeltabs.css";
import $ from "jquery";
import Util from "../util/util";
import IDEMain from "./idemain";
import ModelEditor from "./modeleditor/modeleditor";
import HtmlUtil from "./util/htmlutil";
import Images from "./util/images/images";

export default class ModelTabs {
    tabList: ModelTab[] = [];
    private activeTab?: ModelTab;

    /**
     * Constructs the footer of the IDE element.
     */
    constructor(public main: IDEMain, private html: JQuery<HTMLElement>) {
    }

    addTab(editor: ModelEditor) {
        const existingTab = this.tabList.find(tab => tab.editor === editor);
        if (existingTab) {
            this.markSelectedTab(existingTab);
            return;
        }

        const tab = new ModelTab(editor, this);
        this.html.append(tab.html);
        this.tabList.push(tab);
        this.markSelectedTab(tab);
    }

    select(editor: ModelEditor) {
        const tab = this.tabList.find(tab => tab.editor === editor);
        if (tab) {
            this.markSelectedTab(tab);
        }
    }

    private markSelectedTab(tab: ModelTab) {
        this.tabList.forEach(t => t.html.removeClass('active'));
        tab.html.addClass('active');

        this.activeTab = tab;
        this.main.coverPanel.hide();
        tab.show();
    }

    closeTab(editor: ModelEditor) {
        const tab = this.tabList.find(tab => tab.editor === editor);
        if (tab) {
            this.removeTab(tab);
        }
    }

    removeTab(tab: ModelTab) {
        tab.editor.destroy();
        HtmlUtil.removeHTML(tab.html);
        const tabIndex = Util.removeFromArray(this.tabList, tab);
        if (this.tabList.length === 0) {
            // No more tabs, show the cover panel
            this.activeTab = undefined;
            window.location.hash = '';
            return;
        }
        if (this.activeTab === tab) {
            // If the tab we're closing was active, we select the next one to it
            if (tabIndex >= 0) {
                if (tabIndex < this.tabList.length) {
                    // Select the next one in the list, if there are others
                    this.markSelectedTab(this.tabList[tabIndex]);
                } else if (this.tabList.length > 0) {
                    // Select the previous one, the closed one was the last
                    this.markSelectedTab(this.tabList[this.tabList.length - 1]);
                }
            }
        }
    }
}

export class ModelTab {
    html: JQuery<HTMLElement>;
    constructor(public editor: ModelEditor, public container: ModelTabs) {
        this.html = $(
            `<span class="model-tab" id="modelTab_${editor.fileName}">
                <label class="modelLabel">${editor.fileName}</label>
                <span class="refreshButton" title="Refresh">
                    <img src="${Images.Refresh}" />
                </span>
                <span class="closeButton" title="Close">
                    <img src="${Images.Close}" />
                </span>
            </span>`
        );

        this.html.find('.refreshButton').on('click', (e: JQuery.ClickEvent) => {
            editor.refresh();
            e.stopImmediatePropagation();
            e.preventDefault();
        });

        this.html.find('.closeButton').on('click', (e: JQuery.ClickEvent) => {
            this.container.removeTab(this);
            e.stopImmediatePropagation();
            e.preventDefault();
        });

        this.html.on('click', (e: JQuery.ClickEvent) => {
            this.container.main.ide.open(this.editor.file);
            e.preventDefault();
        });
    }

    show() {
        // this.html.show();
    }
}
