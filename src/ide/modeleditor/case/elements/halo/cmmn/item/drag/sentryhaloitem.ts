import Halo from "../../../halo";
import HaloDragItem from "../../../halodragitem";

export default abstract class SentryHaloItem extends HaloDragItem {

    constructor(halo: Halo, private haloType: Function) {
        super(halo, (haloType as any).smallImage, (haloType as any).typeDescription, halo.rightBar);
    }

    handleMouseUp(e: JQuery.TriggeredEvent) {
        super.handleMouseUp(e);
        const newParent = this.halo.element.case.getItemUnderMouse(e);
        if (newParent && newParent.canHaveCriterion(this.haloType)) {
            newParent.createCriterionAndConnect(this.haloType, this.halo.element, e);
        }
    }
}
