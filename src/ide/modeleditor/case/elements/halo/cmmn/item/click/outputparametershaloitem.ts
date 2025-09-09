import HaloClickItem from "../../../../../../../editors/modelcanvas/halo/haloclickitem";
import Images from "../../../../../../../util/images/images";
import TaskHalo from "../../taskhalo";

export default class OutputParametersHaloItem extends HaloClickItem {
    constructor(halo: TaskHalo) {
        super(halo, Images.TaskOutput, 'Open output parameter mappings of the ' + halo.element.typeDescription, e => halo.element.showMappingsEditor(), halo.bottomBar);
    }
}
