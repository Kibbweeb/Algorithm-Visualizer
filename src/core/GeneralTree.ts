import type { DefTree, DefTreeNode } from "../types/TreeStruct";

class TreeNodes<T> implements DefTreeNode<T> {
    data: T;
    children: TreeNodes<T>[];

    constructor(data: T, children: TreeNodes<T>[] = []){
        this.data = data;
        this.children = children;
    }
}

export class Tree implements DefTree<number>{
    root: TreeNodes<number> | null = null;
    size: number = 0;

    addChild(parentData: number, childData: number): boolean {
        const newNode = new TreeNodes(childData);

        if (this.root === null){
            this.root = newNode;
            this.size++;
            return true;
        }

        const parentNode = this.findNode(this.root, parentData)

        if (parentNode){
            parentNode.children.push(newNode);
            this.size++;
            return true;
        }

        return false;
    }
    
    public findNode (currentNode: TreeNodes<number> | null, targetData: number): TreeNodes<number> | null {
        if (!currentNode) return null;
        if (currentNode.data === targetData) return currentNode;

        for (const child of currentNode.children){
            const found = this.findNode(child, targetData);
            if (found) return found;
        }

        return null;
    }

    private findParentNode(currentNode: TreeNodes<number> | null, targetData: number): TreeNodes<number> | null {
        if (!currentNode) return null;

        for (const child of currentNode.children) {
            if (child.data === targetData) {
                return currentNode;
            }
            const foundParent = this.findParentNode(child, targetData);
            if (foundParent) return foundParent;
        }
        return null;
    }

    constructor() {
    this.addChild(27, 27);
    this.addChild(27, 38);
    this.addChild(27, 51);
    this.addChild(38, 67);
    this.addChild(38, 89); 
    }

    removeChild(data: number): boolean {
        if (!this.root){
            return false;
        }

        if (this.root.data === data){
            this.root = null;
            this.size--;
            return true;
        }

        const parentNode = this.findParentNode(this.root, data);

        if (parentNode) {
            const targetNode = parentNode.children.find(child => child.data === data);
            const countDeletedNodes = (node: TreeNodes<number>): number => {
                let count = 1;
                for (const child of node.children) {
                    count += countDeletedNodes(child);
                }
                return count;
            };

            if (targetNode) {
                this.size -= countDeletedNodes(targetNode);
            }

            parentNode.children = parentNode.children.filter(child => child.data !== data);
            return true;
        }

        return false;
    }

    traverseDFS(callback: (node: TreeNodes<number>) => void): void {
        if (this.root !== null){
            this.dfsHelper(this.root, callback);
        }
    }

    private dfsHelper(currentNode: TreeNodes<number>, callback: (node: TreeNodes<number>) => void) : void{
        callback(currentNode);

        for (const child of currentNode.children){
            this.dfsHelper(child, callback);
        }
    }

    traverseBFS(callback: (node: TreeNodes<number>) => void): void {
        if (!this.root){
            return;
        }

        const queue: TreeNodes<number>[] = [this.root];
        
        while (queue.length > 0){
            const currentNode = queue.shift()!;
            callback(currentNode);

            for (const child of currentNode.children){
                queue.push(child);
            }
        }
    }
    
}