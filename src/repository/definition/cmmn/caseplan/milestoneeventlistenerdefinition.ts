import PlanItem from "./planitem";

/**
 * Simple helper class to re-use logic across milestones and event listeners
 */
export default class MilestoneEventListenerDefinition extends PlanItem {
    get transitions(): string[] {
        return ['occur', 'create', 'reactivate', 'resume', 'suspend', 'terminate'];
    }

    get defaultTransition() {
        return 'occur';
    }

    get entryTransition() {
        return 'occur';
    }
}
