const canvasPaddingBottom = 25,
    canvasPaddingLeft = 25,
    canvasPaddingRight = 25,
    canvasPaddingTop = 25,
    canvasSelector = '#canvas',
    innerSVGSelector = '#canvas > svg',
    logSelector = '#operation-log',
    nodeHeight = 50,
    nodeMarginVertical = 25,
    nodeWidth = 50;

function growth(n) {
    return [...Array(n+1).keys()].map(i => Math.pow(2,i));
}

function pad(str, len) {
  return len === 0 ? '' : str.length < len ? pad("0" + str, len) : str;
}

function traverseNodes(node, path) {
    let result;
    if (node.height === 0) {
        result = null;
    } else if (!path) {
        result = node;
    } else {
        result = traverseNodes(path[0] === '0' ? node.left : node.right, path.slice(1));
    }
    return result;
}

function traverseTree(tree, height, nth) {
    return traverseNodes(tree._root, pad(Number(nth).toString(2), height));
}

function createSVGElement(type, attrs = {}) {
    return Object.entries(attrs).reduce((element, [k, v]) => { element.setAttribute(k, v); return element; }, document.createElementNS('http://www.w3.org/2000/svg', type));
}

function createNodeView(h, nth, x, y, parentX, parentY) {
    const node = traverseTree(tree, h, nth);
    let nodeView;
    if (node) {
        nodeView = createSVGElement('g');
        const nodeBF = node.bf,
            heavy = nodeBF < -1 ? ' heavy-left' : nodeBF > 1 ? ' heavy-right' : '',
            parentLink = parentX || parentY ? createSVGElement('line', { x1: parentX + nodeWidth / 2, y1: parentY + nodeHeight, x2: x + nodeWidth / 2, y2: y, class: 'parent-link' }) : null,
            nodeBox = createSVGElement('rect', { x: x, y: y, height: nodeHeight, width: nodeWidth, class: 'node' + heavy }),
            value = createSVGElement('text', { x: x + nodeWidth / 2, y: y + nodeHeight / 4, class: 'text value' }),
            leftH = createSVGElement('text', { x: x + nodeWidth / 4, y: y + 3 * nodeHeight / 4, class: 'text height left' }),
            nodeH = createSVGElement('text', { x: x + nodeWidth / 2, y: y + 5 * nodeHeight / 8, class: 'text height node-height' }),
            bf = createSVGElement('text', { x: x + nodeWidth / 2, y: y + 7 * nodeHeight / 8, class: 'text height balance-factor' }),
            rightH = createSVGElement('text', { x: x + 3 * nodeWidth / 4, y: y + 3 * nodeHeight / 4, class: 'text height right' });
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
    }
    return nodeView;
}

function visualise(tree) {
    const treeHeight = tree._root.height,
        treeGrowth = growth(treeHeight),
        numColumns = treeGrowth[treeHeight] - 1,
        canvas = document.querySelector(canvasSelector),
        svg = document.querySelector(innerSVGSelector);
    canvas.style.width = `${canvasPaddingLeft + numColumns * nodeWidth + canvasPaddingRight}px`;
    canvas.style.height = `${canvasPaddingTop + treeHeight * (nodeHeight + nodeMarginVertical) - nodeMarginVertical + canvasPaddingBottom}px`;
    svg.innerHTML = '';
    svg.setAttribute('viewBox', `0 0 ${numColumns * nodeWidth} ${treeHeight * (nodeHeight + nodeMarginVertical) - nodeMarginVertical}`);
    let priorIndentation = 0,
        priorSeparation = 0;
    for (let h = 0; h < treeHeight; ++h) {
        const indentation = treeGrowth[treeHeight - h - 1] - 1,
            separation = treeGrowth[treeHeight - h];
        for (let nth = 0; nth < Math.pow(2, h); ++nth) {
            const parentNth = Math.floor(nth / 2),
                nodeView = createNodeView(
                    h,
                    nth,
                    (indentation + separation * nth) * nodeWidth,
                    h * (nodeHeight + nodeMarginVertical),
                    (priorIndentation + priorSeparation * parentNth) * nodeWidth,
                    (h - 1) * (nodeHeight + nodeMarginVertical)
                );
            if (nodeView) {
                svg.appendChild(nodeView);
            }
        }
        priorIndentation = indentation;
        priorSeparation = separation;
    }
}
