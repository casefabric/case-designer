import StandardEvent from "../sentry/standardevent";

const list: CaseFileItemTransition[] = [];

export default class CaseFileItemTransition extends StandardEvent {
    /**
     * @returns List of the possible events/transitions on a case file item
     */
    static get values(): CaseFileItemTransition[] {
        return list;
    }

    static readonly AddChild = new CaseFileItemTransition('addChild');
    static readonly AddReference = new CaseFileItemTransition('addReference');
    static readonly Create = new CaseFileItemTransition('create');
    static readonly Delete = new CaseFileItemTransition('delete');
    static readonly RemoveChild = new CaseFileItemTransition('removeChild');
    static readonly RemoveReference = new CaseFileItemTransition('removeReference');
    static readonly Replace = new CaseFileItemTransition('replace');
    static readonly Update = new CaseFileItemTransition('update');

    static parse(value: string): CaseFileItemTransition {
        const m = list.find(m => m.value === value);
        return m !== undefined ? m : new CaseFileItemTransition(value, false);
    }

    private constructor(public readonly value: string, valid: boolean = true) {
        super(value, valid, list);
    }
}
