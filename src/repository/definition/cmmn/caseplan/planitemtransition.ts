import StandardEvent from "../sentry/standardevent";

const list: PlanItemTransition[] = [];

export default class PlanItemTransition extends StandardEvent {
    static get values(): PlanItemTransition[] {
        return list;
    }

     static readonly Close = new PlanItemTransition('close');
     static readonly Complete = new PlanItemTransition('complete');
     static readonly Create = new PlanItemTransition('create');
     static readonly Disable = new PlanItemTransition('disable');
     static readonly Enable = new PlanItemTransition('enable');
     static readonly Exit = new PlanItemTransition('exit');
     static readonly Fault = new PlanItemTransition('fault');
     static readonly ManualStart = new PlanItemTransition('manualStart');
     static readonly None = new PlanItemTransition('');
     static readonly Occur = new PlanItemTransition('occur');
     static readonly ParentResume = new PlanItemTransition('parentResume');
     static readonly ParentSuspend = new PlanItemTransition('parentSuspend');
     static readonly ParentTerminate = new PlanItemTransition('parentTerminate');
     static readonly Reactivate = new PlanItemTransition('reactivate');
     static readonly Reenable = new PlanItemTransition('reenable');
     static readonly Resume = new PlanItemTransition('resume');
     static readonly Start = new PlanItemTransition('start');
     static readonly Suspend = new PlanItemTransition('suspend');
     static readonly Terminate = new PlanItemTransition('terminate');
    
    static parse(value: string): PlanItemTransition {
        const m = list.find(m => m.value === value);
        return m !== undefined ? m : new PlanItemTransition(value, false);
    }

    protected constructor(public readonly value: string, valid: boolean = true) {
        super(value, valid, list);
    }
}
