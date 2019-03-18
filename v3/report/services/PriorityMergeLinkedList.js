function Node(data) {
    this.data = data;
    this.next = null;
}

function PriorityMergeLinkedList() {
    this.head = null;
}

PriorityMergeLinkedList.prototype.appendHigherPriority = function (value, node) {
    var nodeData = node.data;

    if (value.s > nodeData.e) {
        if (node.next) {
            return this.append(value, node.next);
        } else {
            node.next = new Node(value);
            return node.next;
        }
    }

    if (value.s == nodeData.s) {
        if (value.e == nodeData.e) {
            nodeData.p = value.p;
            return node.next;
        }
        if (value.e > nodeData.e) {
            nodeData.p = value.p;

            if (node.next == null) {
                return node;
            }

            return this.append({
                s: nodeData.e + 1,
                e: value.e,
                p: value.p
            }, node.next);
        }
        if (value.e < nodeData.e) {
            var newNode = new Node({
                s: value.e + 1,
                e: nodeData.e,
                p: nodeData.p
            });
            newNode.next = node.next;
            node.next = newNode;
            nodeData.p = value.p;
            nodeData.e = value.e;
            return newNode;
        }
    }

    // we are now under the constraint value.s > nodeData.s
    if (value.e == nodeData.e) {
        var newNode = new Node({
            s: value.s,
            e: value.e,
            p: value.p
        });
        newNode.next = node.next;
        node.next = newNode;
        nodeData.e = value.s - 1;
        return newNode;
    }

    if (value.e > nodeData.e) {
        var lastRangeIndex = nodeData.e;

        var newNode = new Node({
            s: value.s,
            e: nodeData.e,
            p: value.p
        });
        newNode.next = node.next;
        node.next = newNode;
        nodeData.e = value.s - 1;

        if (newNode.next == null) { // CR: check if this has been fixed ( last word index should not be beyond word count ( zero based ))
            newNode.data.e = value.e;
            return newNode;
        }

        return this.append({
            s: lastRangeIndex + 1,
            e: value.e,
            p: value.p
        }, newNode.next);
    }


    if (value.e < nodeData.e) {
        var nextNode = node.next;
        var newNode = new Node({
            s: value.s,
            e: value.e,
            p: value.p
        });
        node.next = newNode;

        var newNode2 = new Node({
            s: value.e + 1,
            e: nodeData.e,
            p: nodeData.p
        });

        nodeData.e = value.s - 1;

        newNode2.next = nextNode;
        newNode.next = newNode2;
        return newNode2;

    }
    throw new Error('Should not be possible');
}

PriorityMergeLinkedList.prototype.appendLowerPriority = function (value, node) {
    var nodeData = node.data;

    if (value.s > nodeData.e) {
        if (node.next == null) {
            return node;
        }

        return this.append(value, node.next);
    }

    if (value.s == nodeData.s) {
        if (value.e == nodeData.e) {
            return node.next;
        }
        if (value.e > nodeData.e) {
            if (node.next == null) {
                return node;
            }

            return this.append({
                s: nodeData.e + 1,
                e: value.e,
                p: value.p
            }, node.next);
        }
        if (value.e < nodeData.e) {
            return node;
        }
    }

    // we are now under the constraint " value.s > nodeData.s "

    if (value.e == nodeData.e || value.e < nodeData.e) {
        return node;
    }

    if (value.e > nodeData.e) {

        if (node.next == null) {
            return node
        }

        return this.append({
            s: nodeData.e + 1,
            e: value.e,
            p: value.p
        }, node.next);
    }

    throw new Error('Should not be possible');
}


PriorityMergeLinkedList.prototype.append = function (value, node) {
    var nodeData = node.data;
    if (value.p < nodeData.p) {
        return this.appendHigherPriority(value, node);
    } else {
        return this.appendLowerPriority(value, node);
    }
};

PriorityMergeLinkedList.prototype.add = function (value) {
    var node = new Node(value),
        currentNode = this.head;

    // 1st use-case: an empty list 
    if (!currentNode) {
        this.head = node;
        
        return node;
    }

    // 2nd use-case: a non-empty list
    while (currentNode.next) {
        currentNode = currentNode.next;
    }

    currentNode.next = node;
    
    return node;
};

PriorityMergeLinkedList.prototype.print = function (value) {
    if (this.head == null) return '';

    var result = [];
    var currentNode = this.head;
    do {
        result.push(currentNode.data);
        currentNode = currentNode.next;
    } while (currentNode);

    return result.reduce(function(sum, val) {
        return sum + 'Node-' + val.p + ': ' + val.s + ',' + val.e + '\n';
    }, '');
}

PriorityMergeLinkedList.prototype.toArray = function (value) {
    var result = [];
    if (this.head == null) return [];

    var currentNode = this.head;
    do {
        if (currentNode.data.p < 4) {
            result.push(currentNode.data);
        }
        currentNode = currentNode.next;
    } while (currentNode);

    return result;
}