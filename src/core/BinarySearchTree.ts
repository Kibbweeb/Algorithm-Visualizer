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

}