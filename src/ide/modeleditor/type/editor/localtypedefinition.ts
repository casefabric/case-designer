import TypeDefinition from "@repository/definition/type/typedefinition";
import TypeFile from "@repository/serverfile/typefile";
import MainTypeDefinition from "./maintypedefinition";
import TypeEditor from "./typeeditor";
import TypeRenderer from "./typerenderer";

export default class LocalTypeDefinition {
    definition: TypeDefinition;

    constructor(public editor: TypeEditor, public file: TypeFile, public root?: MainTypeDefinition) {
        if (! file.definition) {
            throw new Error('We need a definition for this');
        }
        this.definition = file.definition;
    }

    async save(source?: TypeRenderer): Promise<void> {
        this.file.source = this.definition.toXML();
        TypeRenderer.refreshOthers(source);
        return this.file.save().then();
    }

    registerLocalDefinition(file: TypeFile): LocalTypeDefinition | undefined {
        return this.root?.registerLocalDefinition(file);
    }

    sameFile(other: LocalTypeDefinition) {
        return other && this.file.fileName === other.file.fileName;
    }
}
