import $ from "jquery";
import CaseFileItemDef from "../../../../repository/definition/cmmn/casefile/casefileitemdef";
import Multiplicity from "../../../../repository/definition/type/multiplicity";
import SchemaDefinition from "../../../../repository/definition/type/schemadefinition";
import SchemaPropertyDefinition from "../../../../repository/definition/type/schemapropertydefinition";
import TypeFile from "../../../../repository/serverfile/typefile";
import Util from "../../../../util/util";
import IDE from "../../../ide";
import HtmlUtil from "../../../util/htmlutil";
import Images from "../../../util/images/images";
import Shapes from "../../../util/images/shapes";
import ModelEditorMetadata from "../../modeleditormetadata";
import TypeModelEditorMetadata from "../typemodeleditormetadata";
import LocalTypeDefinition from "./localtypedefinition";
import PropertyUsage from "./propertyusage";
import SchemaRenderer from "./schemarenderer";
import TypeRenderer from "./typerenderer";
import TypeSelector, { TypeOption } from "./typeselector";

const expandSign = '&nbsp>&nbsp';
const collapseSign = '&nbsp--&nbsp';

export default class PropertyRenderer extends TypeRenderer<SchemaPropertyDefinition> {
    ide: IDE;
    html: JQuery<HTMLElement>;
    htmlContainer!: JQuery<HTMLElement>;
    typeSelector!: TypeSelector;
    inputPropertyName!: JQuery<HTMLElement>;
    inputPropertySelector!: JQuery<HTMLElement>;
    propertyContainer!: JQuery<HTMLElement>;
    schemaRenderer?: SchemaRenderer;
    schemaContainer!: JQuery<HTMLElement>;
    collapseButton!: JQuery<HTMLElement>;

    constructor(public parent: SchemaRenderer, htmlParent: JQuery<HTMLElement>, localType: LocalTypeDefinition, public property: SchemaPropertyDefinition) {
        super(parent.editor, parent, localType, property, htmlParent);
        this.ide = this.editor.ide;
        this.html = $('<div class="property-renderer" ></div>');
        this.htmlParent.append(this.html);
    }

    select() {
        this.propertyContainer.addClass('property-selected');
    }

    deselect() {
        this.propertyContainer.removeClass('property-selected');
    }

    refresh() {
        HtmlUtil.clearHTML(this.htmlContainer);
        this.render();
    }

    render() {
        const optionalSelection = this.definition.isOptional ? `\n<input class="inputSelectProperty" style="display:none;width:12px;position:relative;top:4px" ${this.definition.isSelected ? 'checked' : ''} title="Select property" type="checkbox" />` : '';

        this.htmlContainer = $(
            `<div>
                <div class='property-container' title="${this.path}">
                    <div class="input-name-container">
                        <label class="btnCollapse" style="display:none;width:12px" ExpansionState="expanded">${collapseSign}</label>
                        <img class="cfi-icon" src="${Shapes.CaseFileItem}"></img>${optionalSelection}
                        <input class="inputPropertyName"  type="text" readonly value="${this.property.name}" />
                        <div class="action-icon-container">
                            <img class="action-icon delete-icon" src="${Images.Delete}" title="Delete ..."/>
                            <img class="action-icon add-sibling-icon" src="${Images.AddSiblingNode}" title="Add sibling ..."/>
                            <img class="action-icon add-child-icon" src="${Images.AddChildNode}" title="Add child ..."/>
                        </div>
                    </div>
                    <div class="select-container">
                        <select class="selectType"></select>
                    </div>
                    <div class="select-container">
                        <select class="selectMultiplicity">
                            ${Multiplicity.values.map(m => '<option value="' + m.value + '">' + m.label + '</option>')}
                        </select>
                    </div>
                    <div class="checkbox-container" style="text-align:center">
                        <input type="checkbox" class="checkboxBusinessIdentifier" ${this.property.isBusinessIdentifier ? ' checked' : ''} />
                    </div>
                </div>
                <div class="property-children-container schema-container">
                </div>
            </div>`
        );
        this.html.append(this.htmlContainer);
        this.inputPropertyName = this.htmlContainer.find('.inputPropertyName');
        this.inputPropertySelector = this.htmlContainer.find('.inputSelectProperty');
        this.propertyContainer = this.htmlContainer.find('.property-container');
        this.schemaContainer = this.htmlContainer.find('.property-children-container');
        this.collapseButton = this.htmlContainer.find('.btnCollapse');
        this.addTypeSelector();
        this.renderContainer();
        this.attachEventHandlers();
    }

    addTypeSelector() {
        this.typeSelector = new TypeSelector(this.editor.ide.repository, this.htmlContainer.find('.selectType'), this.property.cmmnType, (typeRef: string) => this.changeType(typeRef), true, [TypeOption.NEW]);
    }

    get isExpanded(): boolean {
        return this.collapseButton.attr('ExpansionState') === 'expanded';
    }

    changeExpansionState() {
        const plus = this.isExpanded ? 'collapsed' : 'expanded';
        const newSign = plus === 'collapsed' ? expandSign : collapseSign;
        this.collapseButton.html(newSign);
        this.collapseButton.attr('ExpansionState', plus);
        this.renderContainer();
    }

    changeSelection(selected: boolean) {
        this.changeProperty('isSelected', selected);
        this.renderContainer();
    }

    async renderContainer() {
        await this.renderPropertyContent();
    }

    async renderPropertyContent() {
        // Clear previous content of the schema container (if present)
        // HtmlUtil.clearHTML(this.schemaContainer);
        this.schemaContainer.css('display', 'none');
        this.inputPropertySelector.css('display', 'none'); // No option for primitive types

        this.propertyContainer.removeClass('complex-type primitive-type');
        if (this.property.isComplexType) {
            this.collapseButton.css('display', '');
            if (this.isExpanded && this.definition.isSelected) this.schemaContainer.css('display', 'block');
            // if (this.definition.isSelected) this.schemaContainer.css('display', 'block');
            this.propertyContainer.addClass('complex-type');
            this.inputPropertySelector.css('display', ''); // Complex types can be selected/deselected

            if (this.property.type === 'object' && this.property.schema) {
                if (!this.schemaRenderer) {
                    this.schemaRenderer = new SchemaRenderer(this.editor, this, this.schemaContainer, this.localType, this.property.schema);;
                    this.schemaRenderer.render();
                }
            } else {
                const typeRef = this.property.typeRef;
                const typeFile = this.ide.repository.getTypes().find(type => type.fileName === typeRef);
                if (typeFile) {
                    const cycle = this.cycleDetected;
                    if (!cycle) {
                        const file: TypeFile = await this.ide.repository.load(typeRef);
                        const nestedLocalType = this.localType.root?.registerLocalDefinition(file);
                        if (nestedLocalType && this.definition.isSelected) {
                            if (!this.schemaRenderer) {
                                this.schemaRenderer = new SchemaRenderer(this.editor, this, this.schemaContainer, nestedLocalType);
                                this.schemaRenderer.render();
                            }
                        }
                    }
                }
            }
        } else {
            this.propertyContainer.addClass('primitive-type');
        }
    }

    get cycleDetected(): string {
        return this.parent.hasCycle(this, this.property.typeRef);
    }

    updateCycleDetection() {
        // Clear previous cycle detected message (if present)
        this.htmlContainer.find('.selectType').parent().css('border', '');
        this.htmlContainer.find('.selectType').attr('title', '');
        const cycle = this.cycleDetected;
        if (cycle && this.definition.isSelected) {
            // const tooltip = `Cycle detected<br/><br/>${cycle}`;
            // this.ide.danger(tooltip, 4000);
            this.htmlContainer.find('.selectType').parent().css('border', '2px solid red');
            this.htmlContainer.find('.selectType').attr('title', 'Cycle detected\n\n' + cycle);
        }
    }

    attachEventHandlers() {
        this.htmlContainer.find('.add-child-icon').on('click', e => this.editor.addChild(e, this));
        this.htmlContainer.find('.add-sibling-icon').on('click', e => this.editor.addSibling(e, this));
        this.htmlContainer.find('.delete-icon').on('click', e => this.removeProperty());

        this.htmlContainer.find('.selectMultiplicity').on('change', e => this.changeProperty('multiplicity', Multiplicity.parse((e.currentTarget as any).value)));
        this.htmlContainer.find('.selectMultiplicity').val(this.property.multiplicity.toString());
        this.htmlContainer.find('.checkboxBusinessIdentifier').on('change', e => this.changeProperty('isBusinessIdentifier', (e.currentTarget as any).checked));
        this.htmlContainer.find('.cfi-icon').on('pointerdown', e => {
            if (this.property.isComplexType && this.editor.case) {
                // Only support drag/drop for complex type
                e.preventDefault();
                e.stopPropagation();
                // Note: we can simply create a definition time and time again, as these CaseFileItemDef objects are not stored in the resulting xml of the case definition
                const cfi: CaseFileItemDef = this.editor.case.caseDefinition.createDefinition(CaseFileItemDef, undefined, this.path, this.name);
                this.editor.case.cfiEditor.startDragging(cfi);
            }
        });

        this.inputPropertySelector.on('change', e => this.changeSelection((e.currentTarget as any).checked));

        // ??? Why is this here? this.htmlContainer.on('keydown', e => e.stopPropagation());
        this.inputPropertyName.on('change', e => this.changeName((e.currentTarget as any).value));
        this.inputPropertyName.on('keyup', e => {
            if (e.which === 9) { // Tab to get inputName focus
                this.editor.selectPropertyRenderer(this);
                this.inputNameFocusHandler();
            }
        });
        this.inputPropertyName.on('leave', () => this.inputNameBlurHandler());
        this.inputPropertyName.on('blur', () => this.inputNameBlurHandler());
        this.inputPropertyName.on('dblclick', () => this.inputNameFocusHandler());
        this.inputPropertyName.on('click', () => this.inputNameFocusHandler());
        this.propertyContainer.on('click', e => {
            e.stopPropagation();
            this.editor.selectPropertyRenderer(this);
        });

        this.htmlContainer.find('.btnCollapse').on('click', e => this.changeExpansionState());
    }

    inputNameBlurHandler() {
        (this.inputPropertyName as any).attr('readonly', true);
        document.getSelection()?.empty();
    }

    inputNameFocusHandler() {
        if (this.editor.selectedPropertyRenderer === this) {
            (this.inputPropertyName as any)?.attr('readonly', false);
            this.inputPropertyName.select();
        }
    }

    /**
     * Remove the property (including nested objects)
     * But first check if the property is still in use. If so, then it cannot be removed.
     */
    removeProperty() {
        if (!PropertyUsage.checkPropertyDeletionAllowed(this)) {
            return;
        }

        // remove from the definition
        Util.removeFromArray(this.property.parent.properties, this.property);
        // Also update the in-memory case definitions that a child is removed.
        this.property.getCaseFileItemReferences().forEach(reference => reference.removeDefinition());

        // remove from the html
        HtmlUtil.removeHTML(this.htmlContainer);
        this.localType.save(this);
    }

    async changeName(newName: string) {
        await PropertyUsage.updateNameChangeInOtherModels(this, newName);
        if (!this.property.type) {
            // Auto detect type  (Eg.: if name is changed into "greeting" search and propoese existing type "Greeting.type")
            const type = this.editor.ide.repository.getTypes().find(definition => definition.name.toLowerCase() == this.property.name.toLowerCase());
            if (type) {
                this.changeType(type.fileName);
                this.htmlContainer.find('.selectType').first().val(type.fileName);
            }
        }
        this.changeProperty('name', newName);
    }

    dropSchemaRenderer() {
        // console.log('Dropping schema renderer of ' + this.definition.typeRef + ' in ' + this.path);
        HtmlUtil.clearHTML(this.schemaContainer);
        this.schemaRenderer?.delete();
        this.schemaRenderer = undefined;
    }

    async changeType(newType: string) {
        if (newType === '<new>') {
            // If <new> is selected create a new Type in repository
            const newTypeModelName = this.__getUniqueTypeName(this.property.name);
            const typeModelEditorMetadata: TypeModelEditorMetadata = <TypeModelEditorMetadata>ModelEditorMetadata.types.find(type => type.fileType === 'type');
            if (typeModelEditorMetadata) {
                newType = await typeModelEditorMetadata.createNewModel(this.ide, newTypeModelName, '');
                this.htmlContainer.find('.selectType').first().val(newType);
                this.typeSelector.typeRef = newType;
            }
        }
        this.dropSchemaRenderer(); // Remove previous schema renderer (if present)
        this.typeSelector.typeRef = newType;
        this.changeProperty('cmmnType', newType);
        await this.renderContainer();
        this.updateCycleDetection();
        // Trigger adding a new (empty) child for easy data entry
        if (this.definition.isComplexType) this.editor.addChild(jQuery.Event(''), this);
    }

    /**
     * Creates a non-existing name for the new type,
     * i.e., one that does not conflict with the existing list of type models.
     * @param typeModelName the name of the type model without the .type filename extension 
     */
    __getUniqueTypeName(typeModelName: string): string {
        while (this.ide.repository.hasFile(typeModelName + '.type')) {
            typeModelName = this.__nextName(typeModelName);
        }
        return typeModelName;
    }

    /**
     * Returns the next name for the specified string; it checks the last
     * characters. For a name like 'abc' it will return 'abc_1', for 'abc_1' it returns 'abc_2', etc.
     */
    __nextName(proposedName: string): string {
        const underscoreLocation = proposedName.indexOf('_');
        if (underscoreLocation < 0) {
            return proposedName + '_1';
        } else {
            const front = proposedName.substring(0, underscoreLocation + 1);
            const num = new Number(proposedName.substring(underscoreLocation + 1)).valueOf() + 1;
            const newName = front + num;
            return newName;
        }
    }

    changeProperty(propertyName: string, propertyValue: any) {
        (this.property as any)[propertyName] = propertyValue;
        const schema = /** @type {SchemaDefinition} */ (this.property.parent);
        const indexOfProperty = schema.properties.indexOf(this.property);
        if (indexOfProperty === schema.properties.length - 1 && this.editor.quickEditMode) {
            // if in edit mode: insert an empty transient placeholder property (this is for users convenience while adding multiple new properties) 
            this.parent.addEmptyPropertyRenderer(this);
        }
        this.localType.save(this);
    }

    /**
     * Returns true if the typeRef is available as type in this renderer.
     */
    hasCycle(source: PropertyRenderer, typeRef: string): string {
        if (this.property.type === typeRef) {
            return 'Property in use';
        } else {
            return super.hasCycle(source, typeRef);
        }
    }
}
