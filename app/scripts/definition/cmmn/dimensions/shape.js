class ShapeDefinition extends DiagramElement {
    /**
     * Representation of a <CMMNShape> element
     * 
     * @param {Element} importNode 
     * @param {Dimensions} dimensions 
     */
    constructor(importNode, dimensions) {
        super(importNode, dimensions, dimensions);
        this.cmmnElementRef = this.parseAttribute(CMMNELEMENTREF);
        if (!this.cmmnElementRef) {
            this.dimensions.addParseWarning('Encountered a shape node in dimensions without a reference to a CMMN element');
        }
        this.bounds = this.parseElement(BOUNDS, Bounds);
        if (!this.bounds) {
            this.dimensions.addParseError('The Shape node for ' + this.cmmnElementRef + ' does not have a Bounds node; it cannot be used to draw element ' + this.cmmnElementRef);
        }
    }

    /**
     * @returns {Bounds}
     */
    get bounds() {
        if (!this._bounds) {
            this._bounds = new Bounds(undefined, this.dimensions, this);
        }
        return this._bounds;
    }

    set bounds(bounds) {
        this._bounds = bounds;
    }

    /**
     * removeDefinition is an "override" implementation of CMMNElementDefinition.removeDefinition.
     * Within CMMNElement, the __delete() method invokes this.definition.removeDefinition(), which in fact removes the CMMNElementDefinition
     * from the CaseDefinition. However, for TextAnnotation and CaseFileItem, this.definition refers to the custom shape, instead of to a CMMNElementDefinition.
     * Therefore we "override" this method here and update the internal registration.
     */
    removeShape() {
        // Remove the shape from the dimensions as well
        this.dimensions.removeShape(this);
    }

    createExportNode(diagramNode, tagName = CMMNSHAPE, ...propertyNames) {
        super.createExportNode(diagramNode, tagName, 'cmmnElementRef', 'bounds', propertyNames);
    }

    get hasError() {
        return this.bounds.hasError;
    }

    get errorText() {
        return this.bounds.errorText;
    }

    /**
     * Determines whether this shape surrounds the other shape
     * @param {ShapeDefinition} other 
     */
    surrounds(other) {
        return this != other && this.x <= other.x && this.y <= other.y && this.width + this.x >= other.width + other.x && this.height + this.y >= other.height + other.y;
    }

    get x() {
        return this.bounds.x;
    }

    set x(x) {
        this.bounds.x = x;
    }

    get y() {
        return this.bounds.y;
    }

    set y(y) {
        this.bounds.y = y;
    }

    get width() {
        return this.bounds.w;
    }

    set width(w) {
        this.bounds.w = w;
    }

    get height() {
        return this.bounds.h;
    }

    set height(h) {
        this.bounds.h = h;
    }

    toString() {
        return this.constructor.name + `[x=${this.x}, y=${this.y}, width=${this.width}, height=${this.height}`;
    }
}

class CustomShape extends ShapeDefinition {
    constructor(importNode, dimensions) {
        super(importNode, dimensions);
        this.parentId = this.parseAttribute('parentId');
        if (!this.parentId) { // compatibility
            this.parentId = this.parseAttribute('parentid');
        }
    }

    migrate() {
        const shape = new ShapeDefinition(undefined, this.dimensions);
        shape.cmmnElementRef = this.cmmnElementRef;
        shape.x = this.x;
        shape.y = this.y;
        shape.width = this.width;
        shape.height = this.height;
        this.dimensions.addShape(shape);
        return shape;
    }

    createExportNode() {
        // nothing to export no more
    }
}

class CaseFileItemShape extends CustomShape {
    constructor(importNode, dimensions) {
        super(importNode, dimensions);
        this.contextRef = this.parseAttribute('contextRef');
    }

    migrate() {
        const shape = new ShapeDefinition(undefined, this.dimensions);
        shape.cmmnElementRef = this.contextRef;
        this.dimensions.edges.forEach(edge => {
            if (edge.sourceId === this.cmmnElementRef) {
                edge.sourceId = this.contextRef;
            } else if (edge.targetId === this.cmmnElementRef) {
                edge.targetId = this.contextRef;
            }
        })
        shape.x = this.x;
        shape.y = this.y;
        shape.width = this.width;
        shape.height = this.height;
        this.dimensions.addShape(shape);
        return shape;
    }
}

class TextBoxShape extends CustomShape {
    constructor(importNode, dimensions) {
        super(importNode, dimensions);
        this.content = this.parseAttribute('content', '');
    }
}
