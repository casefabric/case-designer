export default class Path {
    static readonly separator: string = '/';
    static parse(sPath: string): Path {
        const parts = sPath.split(this.separator).filter(p => p.trim().length > 0).map(p => new Path(p));
        parts.forEach((part, index) => {
            if (index > 0) {
                part.parent = parts[index - 1];
            }
        });
        return parts.length > 0 ? parts[parts.length - 1] : new Path('');
    }

    public name: string = '';
    public value: string = '';
    public index: number = -1;
    public parent?: Path;

    constructor(public readonly source: string) {
        const openBracket = source.indexOf('[');
        const closeBracket = source.indexOf(']');
        this.name = source.substring(0, openBracket > -1 ? openBracket : source.length);
        this.value = openBracket > -1 && closeBracket > openBracket ? source.substring(openBracket + 1, closeBracket) : '';
        if (this.value) {
            this.index = Number.parseInt(this.value);
        }
    }

    isEmpty(): boolean {
        return this.source.length == 0;
    }

    hasParent(): boolean {
        return this.parent !== undefined;
    }

    toString(): string {
        return this.hasParent() ? this.parent?.toString() + Path.separator + this.source : this.source;
    }
}
