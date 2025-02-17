import $ from "jquery";
import RepositoryBrowser from "./browser/repositorybrowser";
import IDE from "./ide";
import ModelTabs from "./modeltabs";
import LeftSplitter from "./splitter/leftsplitter";

export default class IDEMain {
    html: JQuery<HTMLElement>;
    repositoryBrowser: RepositoryBrowser;
    divModelEditors: JQuery<HTMLElement>;
    tabs: ModelTabs;
    splitter: LeftSplitter;

    /**
     * Constructs the footer of the IDE element.
     */
    constructor(public ide: IDE) {
        this.ide = ide;
        this.html = $(
            `<div class="ide-main" id="ideMain">
                <div class="repository-browser basicbox"></div>
                <div class="model-editors">
                    <div class="model-tabs"></div>
                </div>
            </div>`
        );
        this.ide.html.append(this.html);

        // Now set the pointers on the this object;
        this.repositoryBrowser = new RepositoryBrowser(ide, this.html.find('.repository-browser'));
        this.divModelEditors = this.html.find('.model-editors');
        this.tabs = new ModelTabs(this.html.find('.model-tabs'));

        // Make a splitter between repository browser and the fixed editors div; it should also reposition the case model editor's splitter each time
        this.splitter = new LeftSplitter(this.html, '15%');
    }
}
