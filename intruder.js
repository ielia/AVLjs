class Operation {
    constructor(callee, name, ...args) {
        this.callee = callee.decorated;
        this.name = name;
        this.args = args;
    }
}

class NodeIntruder /* extends NodeInterface */ {
    constructor(node, ops) {
        this.decorated = node;
        this.ops = ops || [];
    }

    get cmp() { return this.decorated.cmp; }

    get left() { return this.decorated.left; }
    set left(left) {
        this.ops.push(new Operation(this, 'set left', left));
        this.decorated.left = left;
    }

    get right() { return this.decorated.right; }
    set right(right) {
        this.ops.push(new Operation(this, 'set right', right));
        this.decorated.right = right;
    }

    get leftH() { return this.decorated.leftH; }
    get rightH() { return this.decorated.rightH; }
    get height() { return this.decorated.height; }
    get bf() { return this.decorated.bh; }

    get value() { return this.decorated.value; }

    _createNullNode(branchName) { return new NodeIntruder(this.decorated._createNullNode(), this.ops); }

    accept(visitor) { this.decorated.height ? visitor.visitNode(this) : visitor.visitNullNode(this); }

    add(value) {
        this.ops.push(new Operation(this, 'begin add', value));
        let [dir, top] = this.decorated.add(value);
        if (!top.ops) {
            top = new NodeIntruder(top, this.ops);
        }
        this.ops.push(new Operation(this, 'end add', value));
        return [dir, top];
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

