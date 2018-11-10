class Node {
    static nullNode(instance, branchName) {
        const nullNode = {
            accept: (visitor) => { visitor.visitNullNode(nullNode); },
            add: (value) => { const rotated = new Node(value, instance.cmp); instance[branchName] = rotated; return [0, rotated]; },
            has: () => false,
            height: 0,
            _rotateLeft: () => {},
            _rotateRight: () => {}
        };
        return nullNode;
    }

    constructor(value, cmp) {
        this._cmp = cmp || ((a, b) => a - b);
        this._value = value;
        this.left = null;
        this.right = null;
    }

    get cmp() { return this._cmp; }

    get left() { return this._left; }
    set left(left) {
        this._left = left && left.height ? left : this._createNullNode('left');
        this._leftH = this._left.height;
    }

    get right() { return this._right; }
    set right(right) {
        this._right = right && right.height ? right : this._createNullNode('right');
        this._rightH = this._right.height;
    }

    get leftH() { return this._leftH; }
    get rightH() { return this._rightH; }
    get height() { return Math.max(this._leftH, this._rightH) + 1; }
    get bf() { return this._rightH - this._leftH; }

    get value() { return this._value; }

    _createNullNode(branchName) {
        return Node.nullNode(this, branchName);
    }

    accept(visitor) {
        visitor.visitNode(this);
    }

    add(value) {
        const dir = this._cmp(value, this.value);
        let subdir = 0;
        if (dir < 0) {
            [subdir, this.left] = this.left.add(value);
        } else if (dir > 0) {
            [subdir, this.right] = this.right.add(value);
        }

        let rotated = this;
        const bf = this.bf;
        if (bf < -1) {
            if (subdir > 0) {
                this.left = this.left._rotateLeft();
            }
            rotated = this._rotateRight();
        } else if (bf > 1) {
            if (subdir < 0) {
                this.right = this.right._rotateRight();
            }
            rotated = this._rotateLeft();
        }
        return [dir, rotated];
    }

    _rotateLeft() {
        const child = this.right,
            middle = child.left;
        this.right = middle;
        child.left = this;
        return child;
    }

    _rotateRight() {
        const child = this.left,
            middle = child.right;
        this.left = middle;
        child.right = this;
        return child;
    }

    has(value) {
        const dir = this._cmp(value, this._value);
        return !dir || (dir < 0 ? this._left.has(value) : this._right.has(value));
    }
}

class NodeCollector {
    constructor() {
        this._collection = [];
    }

    visitNode(node) {
        node.left.accept(this);
        this._collection.push(node.value);
        node.right.accept(this);
    }

    visitNullNode() {}

    get collection() { return this._collection; }
}

class NodeStringifier {
    constructor() {
        this._nodeString = '';
    }

    visitNode(node) {
        this._nodeString += '[';
        node.left.accept(this);
        this._nodeString += ', (' + node.leftH + ')' + node.value + '(' + node.rightH + '), ';
        node.right.accept(this);
        this._nodeString += ']';
    }

    visitNullNode() {}

    get nodeString() { return this._nodeString; }
}

class Tree {
    constructor(cmp) {
        this._cmp = cmp || ((a, b) => a - b);
        this._root = { accept: (visitor) => { visitor.visitNullNode(this._root); }, add: (value) => [1, new Node(value, this._cmp)], has: () => false, height: 0 };
    }

    add(value) {
        let dir;
        [dir, this._root] = this._root.add(value);
        return dir !== 0;
    }

    has(value) { return this._root.has(value); }

    collect() {
        const nodeCollector = new NodeCollector();
        this._root.accept(nodeCollector);
        return nodeCollector.collection;
    }

    toString() {
        const nodeStringifier = new NodeStringifier();
        this._root.accept(nodeStringifier);
        return 'Tree{' + nodeStringifier.nodeString + '}';
    }
}

