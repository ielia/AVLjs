const canvasSelector = '.canvas';

function growth(n) {
    let result;
    if (n < 1) {
        result = [0];
    } else {
        result = growth(n - 1);
        result.push(result[result.length - 1] * 2 + 1);
    }
    return result;
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

function visualise(tree) {
    const treeHeight = tree._root.height,
        treeGrowth = growth(treeHeight),
        numColumns = treeGrowth[treeHeight],
        canvas = document.querySelector(canvasSelector);
    // console.log('TREE HEIGHT:', treeHeight, '| TREE GROWTH:', treeGrowth);
    canvas.innerHTML = '';
    canvas.style.width = `${numColumns * 60}px`;
    canvas.style.height = `${treeHeight * 50}px`;
    for (let i = 0; i < treeHeight; ++i) {
        const indentation = treeGrowth[treeHeight - i - 1],
            separation = treeGrowth[treeHeight - i] + 1,
            row = document.createElement('div');
        row.className = 'row';
        canvas.appendChild(row);
        // console.log('ROW i:', i, ', indent:', indentation, ', separation:', separation);
        for (let j = 0; j < numColumns; ++j) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            row.appendChild(cell);
            if (j >= indentation && !((j - indentation) % separation)) {
                const nth = ((j - indentation) / separation),
                    node = traverseTree(tree, i, nth);
                // console.log('NODE i:', i, ', j:', j, ', nth:', nth, 'node:', node);
                if (node) {
                    cell.className = 'cell node';
                    cell.innerHTML = node.value;
                }
            }
        }
    }
}
