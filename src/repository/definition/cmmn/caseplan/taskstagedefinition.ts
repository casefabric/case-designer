import { Element } from "../../../../util/xml";
import CaseDefinition from "../casedefinition";
import PlanItem from "./planitem";
import PlanItemTransition from "./planitemtransition";
import PlanningTableDefinition from "./planning/planningtabledefinition";

/**
 * Simple helper class to re-use logic across stages and tasks
 */
export default abstract class TaskStageDefinition extends PlanItem {
    planningTable?: PlanningTableDefinition;
    constructor(importNode: Element,
        caseDefinition: CaseDefinition, public parent: TaskStageDefinition | PlanningTableDefinition) {
        super(importNode, caseDefinition, parent);
        this.planningTable = this.parseElement('planningTable', PlanningTableDefinition);
    }

    getPlanningTable() {
        if (!this.planningTable) {
            this.planningTable = super.createDefinition(PlanningTableDefinition);
        }
        return this.planningTable;
    }

    get isTask() {
        return false;
    }

    get isStage() {
        return false;
    }

    get transitions() {
        return StageTaskTransition.values;
    }

    get defaultTransition() {
        return StageTaskTransition.Complete;
    }

    get entryTransition() {
        return PlanItemTransition.Start;
    }
}

export class StageTaskTransition extends PlanItemTransition {
    static get values(): PlanItemTransition[] {
        return [
            PlanItemTransition.None,
            PlanItemTransition.Complete,
            PlanItemTransition.Create,
            PlanItemTransition.Disable,
            PlanItemTransition.Enable,
            PlanItemTransition.Exit,
            PlanItemTransition.Fault,
            PlanItemTransition.ManualStart,
            PlanItemTransition.ParentResume,
            PlanItemTransition.ParentSuspend,
            PlanItemTransition.Reactivate,
            PlanItemTransition.Reenable,
            PlanItemTransition.Resume,
            PlanItemTransition.Start,
            PlanItemTransition.Suspend,
            PlanItemTransition.Terminate
        ];
    }
}
