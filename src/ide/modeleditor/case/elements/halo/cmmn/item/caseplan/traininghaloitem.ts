import Icons from "../../../../../../../util/images/icons";
import Halo from "../../../halo";
import HaloClickItem from "../../../haloclickitem";

export default class TrainingHaloItem extends HaloClickItem {
    constructor(halo: Halo) {
        super(halo, Icons.AITask, 'Train on case', e => this.halo.element.case.trainingForm.show());
    }
}
