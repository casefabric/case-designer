import { Document, DOMParser, Element, Node, XMLSerializer } from '@xmldom/xmldom';
import xmlformatter from 'xml-formatter';

export default class XML {
    /**
     * Parses the given xml string into a Document object
     * If there are parse failures, this will return undefined.
     * @param {String|Node} xml
     * @returns {Document|undefined}
     */
    static parseXML(xml) {
        if (xml === undefined) {
            return undefined;
        }

        if (typeof (XMLDocument) !== 'undefined' && xml instanceof XMLDocument) {
            return xml;
        } else if (xml instanceof Document) {
            return xml;
        } else if (xml instanceof Node) {
            return xml.ownerDocument;
        }
        const xmlDocument = XML.loadXMLString(xml);
        if (XML.getParseErrors(xmlDocument).length === 0) {
            return xmlDocument;
        } else {
            return undefined;
        }
    }

    /**
     * Returns a list with parse errors, if any.
     * If there are no parse errors, then the list is empty.
     * @param {Document} xmlDocument 
     * @returns {Array<String>}
     */
    static getParseErrors(xmlDocument) {
        const errors = [];
        const parseErrors = xmlDocument.getElementsByTagName('parsererror');
        for (let i = 0; i < parseErrors.length; i++) {
            errors.push(parseErrors.item(i).textContent);
        }
        return errors;
    }

    /**
     * returns true when the xmlDcoument has no errors, false when there are errors during parsing of XML
     * @param {Document} xmlDocument 
     * @returns {Boolean}
     */
    static isValid(xmlDocument) {
        return this.getParseErrors(xmlDocument).length === 0;
    }

    /**
     * returns true when the xmlDcoument has errors, false when there are errors during parsing of XML
     * @param {Document} xmlDocument 
     * @returns {Boolean}
     */
    static hasParseErrors(xmlDocument) {
        return !this.isValid(xmlDocument);
    }

    /**
     * returns an xml document based on the passed string
     * @param {String} txt 
     * @returns {Document}
     */
    static loadXMLString(txt) {
        if (txt === undefined || txt.length === 0) {
            return new DOMParser().parseFromString('<parsererror>no text passed</parsererror>', 'text/xml');
        }
        try {
            const doc = new DOMParser().parseFromString(txt, 'text/xml');
            return doc;
        } catch (e) {
            return new DOMParser().parseFromString(`<parsererror>${e}</parsererror>`, 'text/xml');
        }
    }

    /**
     * Creates a child element with the specified tagName.
     * If the parentNode is of type Element the new child will be appended to it.
     * If the parentNode is a Document, then the new child is not appended.
     * 
     * @param {Element | Document} parentNode 
     * @param {String} tagName 
     * @param {String} namespace 
     * @returns {Element} The newly created element
     */
    static createChildElement(parentNode, tagName, namespace = "http://www.omg.org/spec/CMMN/20151109/MODEL") {
        if (parentNode instanceof Document) {
            if (tagName.indexOf('cafienne:') === 0) {
                namespace = 'org.cafienne';
            }
            return parentNode.createElementNS(namespace, tagName);
        } else {
            if (tagName.indexOf('cafienne:') === 0) {
                namespace = 'org.cafienne';
            } else {
                // console.log("Creating node '" + tagName+"' - asked to do within namespace " +namespace);
                namespace = parentNode.lookupNamespaceURI(null);
                // console.log("Creating node '" + tagName+"' - changed namespace to " +namespace);
            }
            const child = parentNode.appendChild(parentNode.ownerDocument.createElementNS(namespace, tagName));
            // console.log("Created child " + XML.prettyPrint(child) +"\t with ns: " + child.namespaceURI)
            return child;
        }
    }

    /**
     * Creates a text node with the specified text and appends it to the parentNode
     * @param {Node} parentNode 
     * @param {String} text 
     * @returns {Text} The newly created element
     */
    static createTextChild(parentNode, text) {
        return parentNode.appendChild(parentNode.ownerDocument.createTextNode(text));
    }
    /**

     * Returns the first element child of xmlNode that has the corresponding tagName, or undefined. 
     * @param {Element | Document} xmlNode 
     * @param {String} tagName 
     * @returns {Element}
     */
    static getChildByTagName(xmlNode, tagName) {
        const children = XML.getChildrenByTagName(xmlNode, tagName);
        return children.length > 0 ? children[0] : undefined;
    }

    /**
     * Wrapper function around DOM.getElementsByTagName, but yielding only direct children of XML node.
     * Returns an Array.
     * @param {Element | Document} xmlNode 
     * @param {String} tagName 
     * @returns {Array<Element>}
     */
    static getChildrenByTagName(xmlNode, tagName) {
        const elementsArray = [];
        XML.getElementsByTagName(xmlNode, tagName).forEach(element => {
            if (element.parentNode == xmlNode) elementsArray.push(element);
        });
        return elementsArray;
    }
    /**
     * Returns all children of the node as an array. Easier to iterate ...
     * @param {Node} xmlNode 
     * @returns {Array<Node>}
     */
    static children(xmlNode) {
        if (xmlNode == undefined) return [];
        const array = [];
        const nodes = xmlNode.childNodes;
        for (let i = 0; i < nodes.length; i++) {
            array.push(nodes[i]);
        }
        return array;
    }

    /**
    * Returns all elements of the node as an array. Easier to iterate ...
    * @param {Node} xmlNode 
    * @returns {Array<Element>}
    */
    static elements(xmlNode) {
        return this.children(xmlNode).filter(node => node.nodeType === Node.ELEMENT_NODE);
    }

    /**
     * Cleans any empty Text children from the element, but only if there are no other children in it.
     * @param {Element} element 
     */
    static cleanElement(element) {
        const children = XML.children(element);
        if (children.length === 0) {
            // No children, nothing to clean
            return;
        }

        // First check if we have content other than text nodes.
        if (children.filter(node => node.nodeType !== Node.TEXT_NODE).length > 0) {
            // Other content present, nothing to clean
            return;
        }

        const textContent = children.filter(node => node.nodeValue !== null).map(node => node.nodeValue).join('');
        if (textContent.trim().length === 0) {
            // Apparently only empty content, let's remove the nodes.
            children.forEach(node => element.removeChild(node));
        }
    }

    /**
     * Returns an array with all elements under the given XML node
     * @param {Document | Element | Node} xmlNode 
     * @param {Array<Element>} array Optionally provide an array to which the elements will be added, or one will be created
     */
    static allElements(xmlNode, array = []) {
        this.elements(xmlNode).forEach(child => {
            array.push(child);
            this.allElements(child, array);
        })
        return array;
    }

    /**
     * Wrapper function around DOM.getElementsByTagName, returning an array that can be 
     * looped over with a forEach function. If the xmlNode is undefined, an empty array will be returned.
     * @param {Element | Document} xmlNode 
     * @param {String} tagName 
     * @returns {Array<Element>}
     */
    static getElementsByTagName(xmlNode, tagName) {
        if (xmlNode == undefined) return [];
        const elementsArray = [];
        const nodes = xmlNode.getElementsByTagName(tagName);
        for (let i = 0; i < nodes.length; i++) {
            elementsArray.push(nodes[i]);
        }
        return elementsArray;
    }

    /**
     * Return the first element in the node that has the requested tag name
     * @param {Element | Document} xmlNode 
     * @param {String} tagName 
     * @returns {Element | undefined}
     */
    static getElement(xmlNode, tagName) {
        const elements = this.getElementsByTagName(xmlNode, tagName);
        return elements.length > 0 ? elements[0] : undefined;
    }

    /**
     * returns the <![CDATA[..]]> node which is a child of the parentNode. If there is no such node
     * then the parentNode will be returned.
     * For most browsers the CDATA node is the second child of the parentNode, but not always. So look for 'cdata' in the nodename
     * @param {*} parentNode 
     */
    static getCDATANodeOrSelf(parentNode) {
        for (let i = 0; i < parentNode.childNodes.length; i++) {
            const childNode = parentNode.childNodes[i];
            if (childNode.nodeName.toLowerCase().search('cdata') >= 0) {
                return childNode;
            }
        }
        return parentNode;
    }

    /**
     * Removes any attributes from the tree that have the exact same namespace attribute (including the prefix) as the parent element.
     * E.g. a parent and child both having xmlns:cmmn="http://www.omg.org/spec/CMMN/20151109/MODEL", then it will remove it from the child.
     * This is typically needed when an element is created independently and then appended to a new parent.
     * 
     * This method is invoked by default from pretty-printing
     * @param {any} tree 
     */
    static removeUnnecessaryNamespaceAttributes(tree) {
        if (!(tree instanceof Element) && !(tree instanceof Document)) {
            return;
        }
        XML.allElements(tree).forEach(element => {
            const parent = element.parentNode;
            if (parent !== undefined && parent !== null && !(parent instanceof Document)) {
                const xmlnsAttributes = Array.from(element.attributes).map(attribute => attribute.nodeName).filter(name => name.startsWith("xmlns"));
                xmlnsAttributes.forEach(name => {
                    if (parent.getAttribute(name) === element.getAttribute(name)) {
                        element.removeAttribute(name);
                    }
                });
            }
        });
    }

    /**
     * Pretty prints an XML string or node, based on regular expressions.
     * @param {*} object 
     */
    static prettyPrint(object) {
        if (!object) return '';
        // Algorithm below takes a string and formats it; if an XML node is passed, we first serialize it to string.
        const xml = typeof (object) == 'string' ? this.parseXML(object) : object;
        this.removeUnnecessaryNamespaceAttributes(xml);
        const text = new XMLSerializer().serializeToString(xml);

        return xmlformatter(text, {
            collapseContent: true,
            lineSeparator: "\r\n"
        });
    }
}

export { Document, DOMParser, Element, Node, XML, XMLSerializer };

