class Node {
    static nullNode(instance, branchName) {
        return {
            add: (value) => { const rotated = new Node(value, instance.cmp); instance[branchName] = rotated; return [0, rotated]; },
            collect: () => [],
            has: () => false,
            height: 0,
            toString: () => '',
            _rotateChild: () => {}
        };
    }

    constructor(value, cmp) {
        this._cmp = cmp || ((a, b) => a - b);
        this._value = value;
        this.left = null;
        this.right = null;
    }

    get left() { return this._left; }
    set left(left) {
        this._left = left && left.height ? left : Node.nullNode(this, 'left');
        this._leftH = this._left.height;
    }

    get right() { return this._right; }
    set right(right) {
        this._right = right && right.height ? right : Node.nullNode(this, 'right');
        this._rightH = this._right.height;
    }

    get value() { return this._value; }

    get leftH() { return this._leftH; }
    get rightH() { return this._rightH; }
    get height() { return Math.max(this._leftH, this._rightH) + 1; }
    get bf() { return this._rightH - this._leftH; }

    get cmp() { return this._cmp; }
    // set cmp(cmp) {
    //     this._cmp = cmp;
    //     if (this._left) { this._left.cmp = cmp; }
    //     if (this._right) { this._right.cmp = cmp; }
    // }

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
        if (bf < -1 || 1 < bf) {
            if (Math.sign(dir) !== Math.sign(subdir)) {
                const childName = dir < 0 ? 'left' : 'right',
                    child = this[childName];
                this[childName] = child._rotate(subdir);
            }
            rotated = this._rotate(dir);
        }
        return [dir, rotated];
    }

    /**
     * -: right-rotation, +: left-rotation
     */
    _rotate(direction) {
        let rotated = this;
        if (direction) {
            const [childName, opposite] = direction < 0 ? ['left', 'right'] : ['right', 'left'],
                child = this[childName],
                middle = child[opposite];
            this[childName] = middle;
            child[opposite] = this;
            rotated = child;
        }
        return rotated;
    }

    has(value) {
        const dir = this._cmp(value, this._value);
        return !dir || (dir < 0 ? this._left.has(value) : this._right.has(value));
    }

    collect() {
        return this._left.collect().concat([this._value]).concat(this._right.collect());
    }

    toString() {
        return '[' + this.left.toString() + ', (' + this.leftH + ')' + this.value + '(' + this.rightH + '), ' + this.right.toString() + ']';
    }
}

class Tree {
    constructor(cmp) {
        this._cmp = cmp || ((a, b) => a - b);
        this._root = { add: (value) => [1, new Node(value, this._cmp)], collect: () => [], has: () => false, height: 0, toString: () => 'Tree{}' };
    }
    add(value) {
        let dir;
        [dir, this._root] = this._root.add(value);
        return dir !== 0;
    }
    has(value) { return this._root.has(value); }
    print() { console.log('Tree contents:', JSON.stringify(this._root.collect())); }
    toString() { return 'Tree{' + this._root.toString(); + '}'; }
}

