export interface DefTreeNode<T> {
    data: T;
    id: string;
    children: DefTreeNode<T>[];
}

export interface DefTree<T> {
    root: DefTreeNode<T> | null;
    size: number;
    
    addChild(parentId: string, childData: T): string | null;
    removeChild(targetId: string): boolean;
    traverseDFS(callback: (node: DefTreeNode<T>) => void): void;
    traverseBFS(callback: (node: DefTreeNode<T>) => void): void;
}
export interface DefBinaryTreeNode<T> {
    data: T;
    id: string;
    parent: DefBinaryTreeNode<T> | null;
    left: DefBinaryTreeNode<T> | null;
    right: DefBinaryTreeNode<T> | null;
}

export interface DefBinaryTree<T> {
    root: DefBinaryTreeNode<T> | null;
    size: number;

    searchNode(targetData: T): DefBinaryTreeNode<T> | null;
    insertNode(data: T): string | null;
    removeNode(targetId: string): boolean;
}