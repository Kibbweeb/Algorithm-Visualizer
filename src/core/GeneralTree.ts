import type { DefTree, DefTreeNode } from "../types/TreeStruct";

class TreeNodes<T> implements DefTreeNode<T> {
    data: T;
    id: string;
    children: TreeNodes<T>[];

    constructor(data: T, children: TreeNodes<T>[] = []) {
        this.data = data;
        this.id = `node-${crypto.randomUUID()}`;
        this.children = children;
    }
}

export class Tree implements DefTree<number> {
    root: TreeNodes<number> | null = null;
    size: number = 0;

    addChild(parentId: string | null, childData: number): string | null {
        const newNode = new TreeNodes(childData);

        if (this.root === null) {
            this.root = newNode;
            this.size++;
            return newNode.id;
        }

        if (parentId === null) return null; 

        const parentNode = this.findNode(this.root, parentId);

        if (parentNode) {
            parentNode.children.push(newNode);
            this.size++;
            return newNode.id;
        }

        return null;
    }
    
    public findNode(currentNode: TreeNodes<number> | null, targetId: string): TreeNodes<number> | null {
        if (!currentNode) return null;
        if (currentNode.id === targetId) return currentNode;

        for (const child of currentNode.children) {
            const found = this.findNode(child, targetId);
            if (found) return found;
        }

        return null;
    }

    private findParentNode(currentNode: TreeNodes<number> | null, targetId: string): TreeNodes<number> | null {
        if (!currentNode) return null;

        for (const child of currentNode.children) {
            if (child.id === targetId) {
                return currentNode;
            }
            const foundParent = this.findParentNode(child, targetId);
            if (foundParent) return foundParent;
        }
        return null;
    }

    constructor() {
        const rootId = this.addChild(null, 27);
        
        if (rootId) {
            const child38Id = this.addChild(rootId, 38);
            this.addChild(rootId, 51);
            
            if (child38Id) {
                this.addChild(child38Id, 67);
                this.addChild(child38Id, 89);
            }
        }
    }

    removeChild(targetId: string): boolean {
        if (!this.root) {
            return false;
        }

        if (this.root.id === targetId) {
            this.root = null;
            this.size = 0;
            return true;
        }

        const parentNode = this.findParentNode(this.root, targetId);

        if (parentNode) {
            const targetNode = parentNode.children.find(child => child.id === targetId);
            
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

            parentNode.children = parentNode.children.filter(child => child.id !== targetId);
            return true;
        }

        return false;
    }

    traverseDFS(callback: (node: TreeNodes<number>) => void): void {
        if (this.root !== null) {
            this.dfsHelper(this.root, callback);
        }
    }

    private dfsHelper(currentNode: TreeNodes<number>, callback: (node: TreeNodes<number>) => void): void {
        callback(currentNode);
        for (const child of currentNode.children) {
            this.dfsHelper(child, callback);
        }
    }

    traverseBFS(callback: (node: TreeNodes<number>) => void): void {
        if (!this.root) {
            return;
        }

        const queue: TreeNodes<number>[] = [this.root];
        
        while (queue.length > 0) {
            const currentNode = queue.shift()!;
            callback(currentNode);

            for (const child of currentNode.children) {
                queue.push(child);
            }
        }
    }
}