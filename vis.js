const canvasSelector = '#canvas',
    logSelector = '#operation-log';

function growth(n) {
    return [...Array(n+1).keys()].map(i => Math.pow(2,i));
}

function pad(str, len) {
  return len === 0 ? '' : str.length < len ? pad("0" + str, len) : str;
}

function traverseNodes(node, path) {
    // console.log('traverseNodes:', path);
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

function createNodeView(h, nth, cell) {
    const node = traverseTree(tree, h, nth);
    // console.log('NODE h:', h, ', nth:', nth, 'node:', node);
    if (node) {
        cell.className = 'cell node';
        const value = document.createElement('div'),
            leftH = document.createElement('div'),
            rightH = document.createElement('div');
        value.className = 'value';
        value.innerHTML = node.value;
        leftH.className = 'height left';
        leftH.innerHTML = node.left.height;
        rightH.className = 'height right';
        rightH.innerHTML = node.right.height;
        cell.appendChild(value);
        cell.appendChild(leftH);
        cell.appendChild(rightH);
    }
}

function visualise(tree) {
    const treeHeight = tree._root.height,
        treeGrowth = growth(treeHeight),
        numColumns = treeGrowth[treeHeight] - 1,
        canvas = document.querySelector(canvasSelector);
    // console.log('TREE HEIGHT:', treeHeight, '| TREE GROWTH:', treeGrowth);
    canvas.innerHTML = '';
    canvas.style.width = `${numColumns * 60}px`;
    canvas.style.height = `${treeHeight * 75 + 50}px`;
    for (let i = 0; i < treeHeight; ++i) {
        const indentation = treeGrowth[treeHeight - i - 1] - 1,
            separation = treeGrowth[treeHeight - i],
            row = document.createElement('div');
        row.className = 'row';
        canvas.appendChild(row);
        // console.log('ROW i:', i, ', indent:', indentation, ', separation:', separation);
        for (let j = 0; j < numColumns; ++j) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            row.appendChild(cell);
            if (j >= indentation && !((j - indentation) % separation)) {
                createNodeView(i, (j - indentation) / separation, cell);
            }
        }
    }
}
