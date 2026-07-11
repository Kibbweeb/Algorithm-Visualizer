import type {DefBinaryTree, DefBinaryTreeNode} from "../types/TreeStruct";

class BinaryTreeNode<T> implements DefBinaryTreeNode<T> {
    data: T;
    id: string;
    parent: BinaryTreeNode<T> | null;
    left: BinaryTreeNode<T> | null;
    right: BinaryTreeNode<T> | null;

    constructor(data: T, parent: BinaryTreeNode<T> | null = null) {
        this.data = data;
        this.id = `node-${crypto.randomUUID()}`;
        this.parent = parent;
        this.left = null;
        this.right = null;
    }
}

export class BinarySearchTree<T> implements DefBinaryTree<T> {
    root: BinaryTreeNode<T> | null = null;
    size: number = 0;

    searchNode(targetData: T): BinaryTreeNode<T> | null {
        let currentNode = this.root;

        while (currentNode) {
            if (targetData === currentNode.data) {
                return currentNode;
            } else if (targetData < currentNode.data) {
                currentNode = currentNode.left;
            } else {
                currentNode = currentNode.right;
            }
        }
        return null;
    }

    findNodeById(currentNode: BinaryTreeNode<T> | null, targetId: string): BinaryTreeNode<T> | null {
        if (!currentNode) {
            return null;
        }

        if (currentNode.id === targetId) {
            return currentNode;
        }

        let foundNode: BinaryTreeNode<T> | null = this.findNodeById(currentNode.left, targetId);

        if (foundNode) {
            return foundNode;
        }

        return this.findNodeById(currentNode.right, targetId);
    }

    private getMinNode(node: BinaryTreeNode<T>): BinaryTreeNode<T>{
        while (node.left){
            node = node.left;
        }

        return node;
    }

    private transplant(oldNode: BinaryTreeNode<T>, newNode: BinaryTreeNode<T> | null): void {

        if (!oldNode.parent){
            this.root = newNode;
        }

        if (oldNode === oldNode.parent?.left){
            oldNode.parent.left = newNode;
        } 
        else if (oldNode === oldNode.parent?.right){
            oldNode.parent.right = newNode;
        }
        
        if (newNode){
            newNode.parent = oldNode.parent
        }
    }

    insertNode(data: T): string | null {

        if (this.root === null){
            let newNode = new BinaryTreeNode(data);
            this.root = newNode;
            this.size++;
            return this.root.id;
        }

        let currentNode: BinaryTreeNode<T> | null = this.root;
        let parentNode: BinaryTreeNode<T> = this.root;

        while (currentNode){
            if (data === currentNode.data){
                return null;
            }

            parentNode = currentNode;

            if (data < currentNode.data){
                currentNode = currentNode.left;
            } else {
                currentNode = currentNode.right;
            }
        }

        const newNode = new BinaryTreeNode(data, parentNode);

        if (data < parentNode.data){
            parentNode.left = newNode;
        } else {
            parentNode.right = newNode;
        }

        this.size++;
        return newNode.id;
    }

    removeNode(targetId: string): boolean {
        const targetNode = this.findNodeById(this.root, targetId);

        if (targetNode === null){
            return false;
        }

        if (!targetNode.left){
            this.transplant(targetNode, targetNode.right);
        } else if (!targetNode.right){
            this.transplant(targetNode, targetNode.left);
        } else {
            const successor = this.getMinNode(targetNode.right!);

            if (successor.parent !== targetNode){
                this.transplant(successor, successor.right);
                successor.right = targetNode.right;
                successor.right!.parent = successor;
            }

            this.transplant(targetNode, successor);
            successor.left = targetNode.left;
            successor.left!.parent = successor;

        }

        this.size--;
        return true;
    }

    getInOrderPath(node: BinaryTreeNode<T> | null, path: string[] = []): string[] {
    if (node) {
        this.getInOrderPath(node.left, path);
        path.push(node.id);
        this.getInOrderPath(node.right, path);
        }
    return path;
    }

    getPreOrderPath(node: BinaryTreeNode<T> | null, path: string[] = []): string[] {
    if (node) {
        path.push(node.id);
        this.getPreOrderPath(node.left, path);
        this.getPreOrderPath(node.right, path);
        }
    return path;
    }

    getPostOrderPath(node: BinaryTreeNode<T> | null, path: string[] = []): string[] {
    if (node) {
        this.getPostOrderPath(node.left, path);
        this.getPostOrderPath(node.right, path);
        path.push(node.id);
        }
    return path;
    }

    constructor(initialData?: T[]) {
    if (initialData) {
        initialData.forEach(data => this.insertNode(data));
        }
    }

}