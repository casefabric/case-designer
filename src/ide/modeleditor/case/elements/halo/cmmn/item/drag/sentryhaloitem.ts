import HaloDragItem from "../../../../../../../editors/modelcanvas/halo/halodragitem";
import CaseHalo from "../../../casehalo";

export default abstract class SentryHaloItem extends HaloDragItem<CaseHalo> {

    constructor(halo: CaseHalo, private haloType: Function) {
        super(halo, (haloType as any).smallImage, (haloType as any).typeDescription, halo.rightBar);
    }

    handleMouseUp(e: JQuery.TriggeredEvent) {
        super.handleMouseUp(e);
        const newParent = this.halo.element.canvas.getItemUnderMouse(e);
        if (newParent && newParent.canHaveCriterion(this.haloType)) {
            newParent.createCriterionAndConnect(this.haloType, this.halo.element, e);
        }
    }
}
