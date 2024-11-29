import ModelDefinition from "./modeldefinition";
import XMLSerializable from "./xmlserializable";

export default class ExternalReference<M extends ModelDefinition> {
    constructor(private element: XMLSerializable, private ref: string) {
    }

    isEmpty() {
        return this.fileName === '';
    }

    nonEmpty() {
        return !this.isEmpty();
    }

    get fileName() {
        return this.ref;
    }

    async resolve() {

    }

    update(newFileName: string) {
        if (this.ref !== newFileName) {
            // console.log("Setting new reference inside " + this.element +" to value " + newFileName +" (old value was: " + this.ref +")");
            this.ref = newFileName;
        }
    }

    toString() {
        return this.fileName;
    }
}

export class ReferenceSet {
    constructor(public element: XMLSerializable) {}

    private references: ExternalReference<ModelDefinition>[] = [];

    get all() {
        return [...this.references];
    }

    add<M extends ModelDefinition>(fileName: string): ExternalReference<M> {
        const reference = this.references.find(ref => ref.fileName === fileName);
        if (reference) {
            return <ExternalReference<M>>reference;
        }

        const newReference = new ExternalReference<M>(this.element, fileName);
        this.references.push(newReference);
        return newReference;
    }
}
