const CANVAS_PADDING_BOTTOM = 25,
    CANVAS_PADDING_LEFT = 25,
    CANVAS_PADDING_RIGHT = 25,
    CANVAS_PADDING_TOP = 25,
    CANVAS_SELECTOR = '#canvas',
    SVG_SELECTOR = '#canvas > svg',
    LOG_SELECTOR = '#operation-log',
    NODE_VIEW_HEIGHT = 50,
    NODE_VIEW_MARGIN_VERTICAL = 25,
    NODE_VIEW_WIDTH = 50;

class NodeSVGBuilder {
    constructor(treeHeight) {
        this.treeHeight = treeHeight;
        this.treeGrowth = [...Array(this.treeHeight + 1).keys()].map(i => Math.pow(2, i));
        this.numColumns = this.treeGrowth[this.treeHeight] - 1;
        this.canvas = document.querySelector(CANVAS_SELECTOR);
        this.canvas.style.width = `${CANVAS_PADDING_LEFT + this.numColumns * NODE_VIEW_WIDTH + CANVAS_PADDING_RIGHT}px`;
        this.canvas.style.height = `${CANVAS_PADDING_TOP + this.treeHeight * (NODE_VIEW_HEIGHT + NODE_VIEW_MARGIN_VERTICAL) - NODE_VIEW_MARGIN_VERTICAL + CANVAS_PADDING_BOTTOM}px`;
        this.svg = document.querySelector(SVG_SELECTOR);
        this.svg.innerHTML = '';
        this.svg.setAttribute('viewBox', `0 0 ${this.numColumns * NODE_VIEW_WIDTH} ${this.treeHeight * (NODE_VIEW_HEIGHT + NODE_VIEW_MARGIN_VERTICAL) - NODE_VIEW_MARGIN_VERTICAL}`);
        this.priorIndentation = 0;
        this.priorSeparation = 0;
        this.path = '';
    }

    visitNode(node) {
        const currentPath = this.path,
            h = currentPath.length,
            nth = parseInt(currentPath || '0', 2),
            parentNth = Math.floor(nth / 2),
            indentation = this.treeGrowth[this.treeHeight - h - 1] - 1,
            separation = this.treeGrowth[this.treeHeight - h],
            nodeView = this._createNodeView(
                node,
                currentPath,
                h,
                (indentation + separation * nth) * NODE_VIEW_WIDTH,
                h * (NODE_VIEW_HEIGHT + NODE_VIEW_MARGIN_VERTICAL),
                (this.priorIndentation + this.priorSeparation * parentNth) * NODE_VIEW_WIDTH,
                (h - 1) * (NODE_VIEW_HEIGHT + NODE_VIEW_MARGIN_VERTICAL)
            );
        this._visitChild(node.left, currentPath, '0', indentation, separation);
        this._visitChild(node.right, currentPath, '1', indentation, separation);
        this.svg.appendChild(nodeView);
    }

    visitNullNode() {}

    _visitChild(child, currentPath, side, indentation, separation) {
        this.path = currentPath + side;
        this.priorIndentation = indentation;
        this.priorSeparation = separation;
        child.accept(this);
    }

    _createNodeView(node, currentPath, h, x, y, parentX, parentY) {
        const nodeView = this._createSVGElement('g'),
            nodeBF = node.bf,
            heavy = nodeBF < -1 ? ' heavy-left' : nodeBF > 1 ? ' heavy-right' : '',
            parentLink = parentX > 0 || parentY > 0 ? this._createSVGElement('line', { x1: parentX + NODE_VIEW_WIDTH / 2, y1: parentY + NODE_VIEW_HEIGHT / 2, x2: x + NODE_VIEW_WIDTH / 2, y2: y + NODE_VIEW_HEIGHT / 2, class: 'parent-link' }) : null,
            nodeBox = this._createSVGElement('rect', { x: x, y: y, height: NODE_VIEW_HEIGHT, width: NODE_VIEW_WIDTH, class: `node${heavy} path-${currentPath}` }),
            value = this._createSVGElement('text', { x: x + NODE_VIEW_WIDTH / 2, y: y + NODE_VIEW_HEIGHT / 4, class: 'text value' }),
            leftH = this._createSVGElement('text', { x: x + NODE_VIEW_WIDTH / 4, y: y + 3 * NODE_VIEW_HEIGHT / 4, class: 'text height left' }),
            nodeH = this._createSVGElement('text', { x: x + NODE_VIEW_WIDTH / 2, y: y + 5 * NODE_VIEW_HEIGHT / 8, class: 'text height node-height' }),
            bf = this._createSVGElement('text', { x: x + NODE_VIEW_WIDTH / 2, y: y + 7 * NODE_VIEW_HEIGHT / 8, class: 'text height balance-factor' }),
            rightH = this._createSVGElement('text', { x: x + 3 * NODE_VIEW_WIDTH / 4, y: y + 3 * NODE_VIEW_HEIGHT / 4, class: 'text height right' });
        value.innerHTML = node.value;
        leftH.innerHTML = node.leftH;
        nodeH.innerHTML = node.height;
        bf.innerHTML = nodeBF;
        rightH.innerHTML = node.rightH;
        if (parentLink) {
            nodeView.appendChild(parentLink);
        }
        nodeView.appendChild(nodeBox);
        nodeView.appendChild(value);
        nodeView.appendChild(leftH);
        nodeView.appendChild(nodeH);
        nodeView.appendChild(bf);
        nodeView.appendChild(rightH);
        return nodeView;
    }

    _createSVGElement(type, attrs = {}) {
        return Object.entries(attrs).reduce((element, [k, v]) => { element.setAttribute(k, v); return element; }, document.createElementNS('http://www.w3.org/2000/svg', type));
    }
}

function visualise(tree) {
    tree._root.accept(new NodeSVGBuilder(tree._root.height));
}

function insertAndVisualise(tree, number) {
    if (!Number.isNaN(number)) {
        const operationLog = document.getElementById('operation-log'),
            logEntry = document.createElement('div');
        tree.add(number);
        logEntry.className = 'log-entry';
        logEntry.innerHTML = tree.toString() + ` <--- add(${number})`;
        operationLog.prepend(logEntry);
        visualise(tree);
    }
}
