import { Element } from "../../../../util/xml";
import MilestoneEventListenerDefinition from "./milestoneeventlistenerdefinition";

export default class MilestoneDefinition extends MilestoneEventListenerDefinition {
    protected infix() {
        return 'ms';
    }

    createExportNode(parentNode: Element) {
        super.createExportNode(parentNode, 'milestone');
    }
}
