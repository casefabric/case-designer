import Images from "../../../util/images/images";
import Halo from "./halo";
import HaloClickItem from "./haloclickitem";

export default class PrintHaloItem extends HaloClickItem {
    constructor(halo: Halo) {
        super(halo, Images.Print, 'Print', e => this.halo.element.canvas.print());
    }
}
