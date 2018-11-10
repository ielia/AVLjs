const NODE_BOX_SELECTOR = (path) => `#canvas > svg .node.path-${path}`,
    ADD_TIMEOUT = 1000;

class Operation {
    constructor(callee, name, ...args) {
        this.callee = callee.decorated;
        this.name = name;
        this.args = args;
    }
}

class NodeIntruder /* extends NodeInterface */ {
    constructor(tree, node, path, ops) {
        this.tree = tree;
        this.decorated = node;
        this.path = path;
        this.ops = ops || [];
        this.callback = () => {};
    }

    get cmp() { return this.decorated.cmp; }

    get left() { return this.decorated.left; }
    set left(left) {
        this.ops.push(new Operation(this, 'set left', left));
        left.path = this.path + '0';
        this.decorated.left = left;
        this.decorated.left.callback = this.callback;
    }

    get right() { return this.decorated.right; }
    set right(right) {
        this.ops.push(new Operation(this, 'set right', right));
        right.path = this.path + '1';
        this.decorated.right = right;
        this.decorated.right.callback = this.callback;
    }

    get leftH() { return this.decorated.leftH; }
    get rightH() { return this.decorated.rightH; }
    get height() { return this.decorated.height; }
    get bf() { return this.decorated.bh; }

    get value() { return this.decorated.value; }

    _createNullNode(branchName) { return this._decorate(this.decorated._createNullNode(), this.path + (branchName === 'left' ? '0' : '1')); }

    accept(visitor) { this.decorated.height ? visitor.visitNode(this) : visitor.visitNullNode(this); }

    add(value) {
console.log('PATH:', this.path, ', ADDING:', value);
        this.ops.push(new Operation(this, 'begin add', value));

        const self = this,
            nodeView = document.querySelector(NODE_BOX_SELECTOR(this.path)),
            addContinuation = function (dir, top) {
                self._decorate(top, self.path + (dir === true ? '' : dir > 0 ? '1' : dir < 0 ? '0' : ''));
                if (nodeView) { nodeView.setAttribute('class', originalClassName); }
                self.ops.push(new Operation(self, 'end add', value));
                self.callback(dir, top);
            };
        let originalClassName;
        if (nodeView) {
            originalClassName = nodeView.getAttribute('class');
            nodeView.setAttribute('class', originalClassName + ' active');
            this.decorated.left.callback = addContinuation;
            this.decorated.right.callback = addContinuation;
        }

        window.setTimeout(function () {
            let response = self.decorated.add(value, addContinuation);
            if (response) {
                addContinuation(...response);
            }
        }, ADD_TIMEOUT);
    }

    _decorate(node, path) {
        let decorator = node;
        if (node.constructor && node.constructor.name === 'NodeIntruder') {
            decorator.path = path;
        } else {
            decorator = new NodeIntruder(this.tree, node, path, this.ops);
            if (!node.height) {
                decorator.decorated._instance = decorator;
            }
        }
        return decorator;
    }

    _rotateLeft() {
        this.ops.push(new Operation(this, 'begin rotate left'));
        this.decorated._rotateLeft();
        this.ops.push(new Operation(this, 'end rotate left'));
    }

    _rotateRight() {
        this.ops.push(new Operation(this, 'begin rotate left'));
        this.decorated._rotateLeft();
        this.ops.push(new Operation(this, 'end rotate left'));
    }

    has(value) { return this.decorated.has(value); }
}


function visualiseInsertSteps(tree, value, callback) {
    if (!tree._root.constructor || tree._root.constructor.name !== 'NodeIntruder') {
        tree._root = new NodeIntruder(tree, tree._root, '');
    }
    tree._root.add(value, (dir, top) => { tree._root = top; callback(!!dir); });
}
