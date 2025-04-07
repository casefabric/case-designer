import { Element } from "../../../../util/xml";
import CaseDefinition from "../casedefinition";
import PlanItem from "./planitem";
import PlanningTableDefinition from "./planning/planningtabledefinition";

/**
 * Simple helper class to re-use logic across stages and tasks
 */
export default class TaskStageDefinition extends PlanItem {
    planningTable?: PlanningTableDefinition;
    constructor(importNode: Element, caseDefinition: CaseDefinition, public parent: TaskStageDefinition | PlanningTableDefinition) {
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
        return ['complete', 'create', 'disable', 'enable', 'exit', 'fault', 'manualStart', 'parentResume', 'parentSuspend', 'reactivate', 'reenable', 'resume', 'start', 'suspend', 'terminate'];
    }

    get defaultTransition() {
        return 'complete';
    }

    get entryTransition() {
        return 'start';
    }
}
