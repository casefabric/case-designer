const DIMENSIONS = 'dimensions';
const CMMNDI = 'CMMNDI';
const CMMNDIAGRAM = 'CMMNDiagram';
const CMMNSHAPE = 'CMMNShape';
const CMMNEDGE = 'CMMNEdge';
const BOUNDS = 'Bounds';
const WAYPOINT = 'waypoint';
const CMMNELEMENTREF = 'cmmnElementRef';
const SOURCECMMNELEMENTREF = 'sourceCMMNElementRef';
const TARGETCMMNELEMENTREF = 'targetCMMNElementRef';

class Dimensions extends ModelDefinition {
    /**
     * Parses the content of the XML document into dimension structures that can be accessed via this class.
     * @param {ModelDocument} modelDocument 
     */
    constructor(modelDocument) {
        super(modelDocument);
        this.errors = [];
    }

    createShape(x, y, width, height, cmmnElementRef = undefined) {
        const shape = new ShapeDefinition(undefined, this);
        shape.cmmnElementRef = cmmnElementRef;
        shape.x = x;
        shape.y = y;
        shape.width = width;
        shape.height = height;
        this.addShape(shape);
        return shape;
    }

    parseDocument() {
        super.parseDocument();
        /** @type {Array<ShapeDefinition>} */
        this.shapes = this.parseElements(CMMNSHAPE, ShapeDefinition);
        this.parseElements('textbox', TextBoxShape, this.shapes);
        this.parseElements('casefileitem', CaseFileItemShape, this.shapes);
        /** @type {Array<Edge>} */
        this.edges = this.parseElements(CMMNEDGE, Edge);
    }

    /**
     * @returns {Array<TextBoxShape>}
     */
    get migrationShapes() {
        return this.shapes.filter(shape => shape instanceof TextBoxShape);
    }

    /**
     * @returns {Array<CaseFileItemShape>}
     */
    get customShapes() {
        return this.shapes.filter(shape => shape instanceof CaseFileItemShape);
    }

    /**
     * While parsing the XML, an error may occur. This is stored in the overall list of parse errors.
     * @param {String} msg 
     */
    addParseError(msg) {
        this.errors.push(msg);
    }

    /**
     * While parsing the XML, we may encounter valid but incomplete content, for which a warning will be generated.
     * @param {String} msg 
     */
    addParseWarning(msg) {
        this.errors.push(msg);
    }

    /**
     * Returns the shape with the identifier or undefined.
     * @param {CMMNElementDefinition} definition
     * @returns {ShapeDefinition}
     */
    getShape(definition) {
        return this.shapes.find(shape => definition && shape.cmmnElementRef == definition.id);
    }

    /**
     * Adds a shape to the dimensions list.
     * @param {ShapeDefinition} shape 
     */
    addShape(shape) {
        this.shapes.push(shape);
    }

    /**
     * Removes the shape
     * @param {ShapeDefinition} shape 
     */
    removeShape(shape) {
        Util.removeFromArray(this.shapes, shape);
    }

    toXML() {
        const dimString = `<${CMMNDI}> <${CMMNDIAGRAM} /> </${CMMNDI}>`;
        const dimensionsXML = XML.loadXMLString(dimString);
        const diagramNode = dimensionsXML.getElementsByTagName(CMMNDIAGRAM)[0];
        this.shapes.forEach(shape => shape.createExportNode(diagramNode));
        this.edges.forEach(edge => edge.createExportNode(diagramNode));
        return dimensionsXML;
    }
}
