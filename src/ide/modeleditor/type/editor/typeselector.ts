import Repository from "../../../../repository/repository";
import TypeFile from "../../../../repository/serverfile/typefile";
import HtmlUtil from "../../../util/htmlutil";

export class TypeOption {
    /**
     * Creates a new, empty option.
     */
    static get EMPTY() { return new TypeOption('') }
    /**
     * Creates an option with the value '&lt;new&gt;'.
     */
    static get NEW() { return new TypeOption('<new>', '&lt;new&gt;') }

    /**
     * Construct an option that refers to a type.
     * @param value The value of the option ("typeRef")
     * @param label The label of the option
     */
    constructor(public value: string, public label?: string) {
        if (!label) {
            this.label = value;
        }
    }

    html() {
        return `<option value="${this.value}">${this.label}</option>`;
    }
}

export default class TypeSelector {
    typeFiles: TypeFile[];

    constructor(public repository: Repository, public htmlParent: JQuery<HTMLElement>, public typeRef: string, private callback: Function, public hasPrimitiveTypes = false, public additionalOptions: TypeOption[] = []) {
        this.typeFiles = this.repository.getTypes();
        // For now only render the selected option. Other options will only be rendered on focus
        this.getOptions().filter(option => option.value === this.typeRef).forEach(option => this.htmlParent.html(option.html()));
        this.htmlParent.on('focus', e => this.loadOptions());
    }

    loadOptions() {
        HtmlUtil.clearHTML(this.htmlParent);
        this.htmlParent.html(this.getOptions().map(option => option.html()).join(''));
        this.htmlParent.val(this.typeRef);
        this.htmlParent.on('change', e => {
            e.preventDefault();
            e.stopImmediatePropagation();
            this.typeRef = '' + this.htmlParent.val();
            this.callback(this.typeRef);
        });
    }

    private getOptions() {
        // Create options in this order:
        // - Empty
        // - All primitive types (optional)
        // - All additional options (if specified)
        // - All types in repository
        return [...(this.hasPrimitiveTypes ? primitiveOptions : []), TypeOption.EMPTY, ...this.additionalOptions, ...this.typeFiles.map(typeFile => new TypeOption(typeFile.fileName, typeFile.name))];
    }
}

const primitiveOptions = [
    TypeOption.EMPTY
    , new TypeOption('string')
    , new TypeOption('integer')
    , new TypeOption('number')
    , new TypeOption('boolean')
    , new TypeOption('time')
    , new TypeOption('date')
    , new TypeOption('date-time')

    // These elements not (yet) supported
    // , new TypeOption('gYear')
    // , new TypeOption('gYearMonth')
    // , new TypeOption('gMonthDay')
    // , new TypeOption('gDay')
    // , new TypeOption('duration')
    // , new TypeOption('hexBinary')
    // , new TypeOption('base64Binary')
    // , 

    , new TypeOption('uri', 'any URI')
    , new TypeOption('QName')
    , new TypeOption('object')
];
