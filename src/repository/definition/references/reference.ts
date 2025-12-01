import XMLSerializable from "../xmlserializable";
import ReferencingAttribute from "./referencingattribute";

export default abstract class Reference extends ReferencingAttribute {
    constructor(element: XMLSerializable, ref: string) {
        super(element, ref);
    }

    references(something: string | XMLSerializable | Reference) {
        if (this.isEmpty) {
            return false;
        }
        if (something instanceof XMLSerializable) {
            return this.ref === something.id;
        } else if (something instanceof Reference) {
            return this === something;
        } else {
            return this.ref === something;
        }
    }

    removeDefinitionReference(something: string | XMLSerializable | Reference) {
        if (this.references(something)) {
            this.update('');
        }
    }

    remove() {
        this.update('');
    }

    abstract get isInvalid(): boolean;

    abstract update(newReference: string): void;

    resolve() {
    }
}
