import CaseFileItemDef from "../../../../../../../repository/definition/cmmn/casefile/casefileitemdef";
import ElementDefinition from "../../../../../../../repository/definition/elementdefinition";
import TypeDefinition from "../../../../../../../repository/definition/type/typedefinition";
import CFIDFile from "../../../../../../../repository/serverfile/cfidfile";
import CFIDConverter from "./cfidconverter";
import TypeWrapper from "./typewrapper";

export default class CFIWrapper {
    merged = false;
    childWrappers: CFIWrapper[] = [];
    caseElementsUsingCFI: ElementDefinition[] = [];
    cfidFile?: CFIDFile;
    typeWrapper?: TypeWrapper;
    parentType?: TypeDefinition;

    constructor(public converter: CFIDConverter, public cfi: CaseFileItemDef, public parent?: CFIWrapper) {
        this.parent = parent;
        if (this.parent) {
            this.parent.childWrappers.push(this);
        }
        this.converter.cfiWrappers.push(this);
    }

    async load() {
        await this.loadCFIDAsType();
        await this.loadChildren();
    }

    async loadCFIDAsType() {
        if (!this.cfi.definitionRef) {
            throw new Error(`Cannot convert to type, because Case File Item ${this.cfi.name} has no CaseFileItemDefinition associated with it (property 'definitionRef' is missing or empty)`);
        }

        // resolve cfid
        this.cfidFile = this.converter.repository.getCaseFileItemDefinitions().find(file => file.fileName === this.cfi.definitionRef);

        if (!this.cfidFile) {
            throw new Error(`Cannot convert to type, because Case File Item ${this.cfi.name} refers to definition '${this.cfi.definitionRef}', but that file does not exist`)
        }

        this.typeWrapper = await TypeWrapper.getType(this.converter, this.cfidFile);
    }

    async loadChildren() {
        for (let i = 0; i < this.cfi.children.length; i++) {
            const wrapper = new CFIWrapper(this.converter, this.cfi.children[i], this);
            await wrapper.load();
        }
    }

    mergeInto(parentType?: TypeDefinition) {
        if (this.merged) {
            console.log("Type " + this.cfi.name + " is already merged into " + parentType?.name)
        }
        if (!parentType) {
            return;
        }
        this.parentType = parentType;
        if (this.parentType.schema.properties.find(p => p.name === this.cfi.name)) {
            return;
        }
        parentType.schema?.createChildProperty(this.cfi.name, this.typeWrapper?.typeFileName, this.cfi.multiplicity);
        console.group("Merging " + this.cfi.name + " into " + parentType.name);
        this.childWrappers.forEach(child => child.mergeInto(this.typeWrapper?.typeFile.definition));
        console.groupEnd();
        this.merged = true;
    }

    getPath(): string {
        if (this.parent) {
            return this.parent.getPath() + '/' + this.cfi.name;
        } else {
            return this.cfi.name;
        }
    }

    convertUsage() {
        this.caseElementsUsingCFI = this.cfi.searchInboundReferences();
        const oldName = this.cfi.name;
        const oldId = this.cfi.id;
        const newId = this.getPath();
        const newName = this.cfi.name;
        console.groupCollapsed(`Converting usage of ${newId} (old identifier was '${oldId}')`);

        this.caseElementsUsingCFI.forEach(element => {
            console.log(`Changing ${element.constructor.name} to new id ${newId}`);
            element.updateReferences(this.cfi, oldId, newId, oldName, newName);
        });
        console.groupEnd();
    }
}
