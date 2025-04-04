import ModelDefinition from "../../../repository/definition/modeldefinition";
import TypeDefinition from "../../../repository/definition/type/typedefinition";
import ServerFile from "../../../repository/serverfile/serverfile";
import TypeFile from "../../../repository/serverfile/typefile";
import IDE from "../../ide";
import Shapes from "../../util/images/shapes";
import ModelEditorMetadata from "../modeleditormetadata";
import TypeModelEditor from "./typemodeleditor";

export default class TypeModelEditorMetadata extends ModelEditorMetadata {
    get modelList() {
        return this.ide?.repository.getTypes() || [];
    }

    supportsFile(file: ServerFile<ModelDefinition>) {
        return file instanceof TypeFile;
    }

    createEditor(ide: IDE, file: TypeFile) {
        return new TypeModelEditor(ide, file);
    }

    get fileType() {
        return 'type';
    }

    get icon() {
        return Shapes.CaseFileItem;
    }

    get description() {
        return 'Types';
    }

    /**
     * Create a new TypeDefinition model with given name and description 
     */
    async createNewModel(ide: IDE, fullName: string, description: string) {
        const fileName = fullName + '.type';
        const file = ide.repository.createTypeFile(fileName, TypeDefinition.createDefinitionSource(fullName));
        await file.save();
        return fileName;
    }
}
