class BaseNode {
    constructor(cmp) {
        this._cmp = cmp || ((a, b) => a - b);
    }
    get bf() {}
    get cmp() { return this._cmp; }
    get height() {}
    get left() {}
    get leftH() {}
    get right() {}
    get rightH() {}
    get value() {}
    accept(visitor) {}
    add(value) {}
    has(value) {}
}

class NullNode extends BaseNode {
    static getInstance(cmp) {
        if (!NullNode.singleInstance) { NullNode.singleInstance = new NullNode(cmp); }
        return NullNode.singleInstance;
    }
    get bf() { return 0; }
    get height() { return 0; }
    accept(visitor) { visitor.visitNullNode(this); }
    add(value) { return [0, new Node(value, this.cmp)]; }
    has(value) { return false; }
}

class Node extends BaseNode {
    constructor(value, cmp) {
        super(cmp);
        this._value = value;
        this.left = null;
        this.right = null;
    }

    get bf() { return this._rightH - this._leftH; }

    get height() { return Math.max(this._leftH, this._rightH) + 1; }

    get left() { return this._left; }
    set left(left) {
        this._left = left ? left : NullNode.getInstance(this._cmp);
        this._leftH = this._left.height;
    }

    get leftH() { return this._leftH; }

    get right() { return this._right; }
    set right(right) {
        this._right = right ? right : NullNode.getInstance(this._cmp);
        this._rightH = this._right.height;
    }

    get rightH() { return this._rightH; }

    get value() { return this._value; }

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
        return this._balance(dir, subdir);
    }

    _balance(dir, subdir) {
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

class NullRoot extends NullNode {
    add(value) { return [1, super.add(value)[1]]; }
}

class Tree {
    constructor(cmp) {
        this._cmp = cmp || ((a, b) => a - b);
        this._root = new NullRoot(this._cmp);
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

