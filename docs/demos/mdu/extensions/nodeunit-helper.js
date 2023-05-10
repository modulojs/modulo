/*
  Likely to be removed: A helper class that implements a function in
  node unit to make porting unit tests slightly easier.
*/
Modulo.utils.NodeUnitHelper = class NodeUnitHelper {
    constructor() {
        this.failures = [];
        this.failed = false;
    }

    _deepEqual(left, right) {
        if (left === right) { // Same reference
            return true;
        }

        if (!left || !right || left !== Object(left) || right !== Object(right)) {
            return left === right; // Falsy values and other primitives
        }

        if (Object.keys(left).length !== Object.keys(right).length) {
            return false;
        }

        for (const key in left) { // Recurse into each property
            if (!(key in right) || !this._deepEqual(left[key], right[key])) {
                return false;
            }
        }
        return true;
    }

    deepEqual(left, right, message = null) {
        if (message === null) {
            if (!this._inequalCount) {
                this._inequalCount = 1; // first
            } else {
                this._inequalCount++;
            }
            message = 'deepEqual#' + this._inequalCount;
        }
        const result = this._deepEqual(left, right);
        if (!result) {
            this.failures.push(message);
            this.failed = JSON.stringify(this.failures);
        }
    }

    done() {
        // presently just a no-op
    }
}

