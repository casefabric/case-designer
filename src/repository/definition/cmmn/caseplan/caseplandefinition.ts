import { Element } from "../../../../util/xml";
import PlanItemTransition from "./planitemtransition";
import StageDefinition from "./stagedefinition";

export default class CasePlanDefinition extends StageDefinition {
    get planItemDefinitions() {
        return this.planItems;
    }

    static get prefix() {
        return 'cm';
    }

    createExportNode(parentNode: Element) {
        super.createExportNode(parentNode, 'casePlanModel');
    }

    get transitions() {
        return CasePlanTransition.values;
    }
}

export class CasePlanTransition extends PlanItemTransition {
    static get values(): PlanItemTransition[] {
        return [
            PlanItemTransition.None,
            PlanItemTransition.Close,
            PlanItemTransition.Complete,
            PlanItemTransition.Create,
            PlanItemTransition.Reactivate,
            PlanItemTransition.Suspend,
            PlanItemTransition.Terminate
        ];
    }
}
