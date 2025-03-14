import $ from "jquery";
import Images from "../../../../../util/images/images";
import Halo from "../halo";
import HaloItem from "./haloitem";

export default class HaloClickItem extends HaloItem {
    constructor(halo, imgURL, title, clickHandler, html) {
        super(halo, imgURL, title, html);
        this.html.on('click', e => clickHandler(e));
    }
}

export class PropertiesHaloItem extends HaloClickItem {
    /**
     * Returns the default bar in which this item appears
     * @param {Halo} halo 
     */
    static defaultBar(halo) {
        return halo.leftBar;
    }

    constructor(halo) {
        super(halo, Images.Settings, 'Open properties of the ' + halo.element.typeDescription, e => this.element.propertiesView.show(true));
    }
}

export class DeleteHaloItem extends HaloClickItem {
    /**
     * Returns the default bar in which this item appears
     * @param {Halo} halo 
     */
    static defaultBar(halo) {
        return halo.leftBar;
    }

    constructor(halo) {
        super(halo, Images.DeleteBig, 'Delete the ' + halo.element.typeDescription, e => this.element.case.__removeElement(this.element));
    }
}

export class InputParametersHaloItem extends HaloClickItem {
    /**
     * Returns the default bar in which this item appears
     * @param {Halo} halo 
     */
    static defaultBar(halo) {
        return halo.bottomBar;
    }

    constructor(halo) {
        super(halo, Images.TaskInput, 'Open input parameter mappings of the ' + halo.element.typeDescription, e => this.element.showMappingsEditor());
    }
}

export class OutputParametersHaloItem extends HaloClickItem {
    /**
     * Returns the default bar in which this item appears
     * @param {Halo} halo 
     */
    static defaultBar(halo) {
        return halo.bottomBar;
    }

    constructor(halo) {
        super(halo, Images.TaskOutput, 'Open output parameter mappings of the ' + halo.element.typeDescription, e => this.element.showMappingsEditor());
    }
}

export class ZoomTaskImplementationHaloItem extends HaloClickItem {
    /**
     * Returns the default bar in which this item appears
     * @param {Halo} halo 
     */
    static defaultBar(halo) {
        return halo.bottomBar;
    }

    constructor(halo) {
        const implementationRef = halo.element.definition.implementationRef;
        const imgURL = Images.ZoomIn;
        const title = 'Open task implementation - ' + implementationRef + '\nRight-click to open in new tab';
        const html = $(`<a href="./#${implementationRef}" title="${title}" ><img src="${imgURL}" /></a>`);
        super(halo, imgURL, title, e => window.location.hash = implementationRef, html);
    }
}
export class PreviewTaskFormHaloItem extends HaloClickItem {
    /**
     * Returns the default bar in which this item appears
     * @param {Halo} halo 
     */
    static defaultBar(halo) {
        return halo.bottomBar;
    }

    constructor(halo) {
        super(halo, Images.Preview, 'Preview Task Form', e => this.element.previewTaskForm());
    }
}
export class InvalidPreviewTaskFormHaloItem extends HaloClickItem {
    /**
     * Returns the default bar in which this item appears
     * @param {Halo} halo 
     */
    static defaultBar(halo) {
        return halo.bottomBar;
    }

    constructor(halo) {
        super(halo, Images.Preview, 'Task Preview not available', e => { });
        // this.html.css('background-color', 'red');
        this.html.css('border', '2px solid red');
    }
}

export class NewTaskImplemenationHaloItem extends HaloClickItem {
    /**
     * Returns the default bar in which this item appears
     * @param {Halo} halo 
     */
    static defaultBar(halo) {
        return halo.leftBar;
    }

    constructor(halo) {
        super(halo, Images.NewModel, 'Create a new implementation for the task', e => this.element.generateNewTaskImplementation());
    }
}


export class WorkflowHaloItem extends HaloClickItem {
    /**
     * Returns the default bar in which this item appears
     * @param {Halo} halo 
     */
    static defaultBar(halo) {
        return halo.leftBar;
    }

    constructor(halo) {
        super(halo, Images.BlockingHumanTaskHalo, 'Open workflow properties', e => this.element.showWorkflowProperties());
    }
}
