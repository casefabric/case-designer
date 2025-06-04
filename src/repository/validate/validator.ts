import ModelDefinition from "../definition/modeldefinition";
import XMLSerializable from "../definition/xmlserializable";
import Error from "./error";
import Remark from "./remark";
import Warning from "./warning";

class Printer {
    private enabled: boolean = true;

    startGroup(msg: string) {
        if (this.enabled) console.groupCollapsed(msg);
    }

    log(msg: string) {
        if (this.enabled) console.log(msg);
    }

    closeGroup() {
        if (this.enabled) console.groupEnd();
    }
}

export default class Validator {
    private remarks: Remark[] = [];
    private models: ModelDefinition[];
    private printer: Printer = new Printer();
    constructor(public readonly model: ModelDefinition) {
        this.models = [model, ...model.dependencies()]
    }

    run() {
        this.printer.startGroup(`Running validations for ${this.model}`);
        this.models.forEach(model => {
            this.printer.startGroup(`Running validations for ${model}`);
            model.elements.forEach(element => element.validate(this))
            this.printer.closeGroup();
        });
        this.printer.log(`Validation resulted in ${this.remarks.length} remarks\n${this.remarks.map((r, i) => `${i + 1} - ${r}`).join('\n')}`);
        this.printer.closeGroup();
        return this;
    }

    add(remark: Remark) {
        this.printer.log(`Adding ${remark}`);
        this.remarks.push(remark);
    }

    mustExist(element: XMLSerializable, propertyValue: any, description: string) {
        if (missesValue(propertyValue)) {
            this.raiseError(element, `${element} misses a ${description}`);
        }
    }

    mustHaveName(element: XMLSerializable) {
        if (!element.name) {
            this.raiseError(element, `${element} must have a name`);
        }
    }

    raiseWarning(element: XMLSerializable, description: string, ...args: any[]) {
        this.add(new Warning(element, description));
    }

    raiseError(element: XMLSerializable, description: string, ...args: any[]) {
        this.add(new Error(element, description));
    }

    get problems() {
        return [...this.remarks];
    }

    get errors() {
        return [...this.remarks.filter(r => r.isError())];
    }

    get warnings() {
        return [...this.remarks.filter(r => r.isWarning())];
    }
}

function missesValue(value: any): boolean {
    return value === undefined || value === null || value === '';
}
