
export default class AttributeDefinition {
    constructor(public readonly value: string, valid: boolean = true, private list: AttributeDefinition[]) {
        if (valid) list.push(this);
    }
    
    get isInvalid() {
        return this.list.indexOf(this) < 0;
    }

    get isEmpty() {
        return this.value.trim().length === 0;
    }

    toString(): string {
        return this.value;
    }
}
