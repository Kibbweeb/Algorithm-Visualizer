export interface DefTreeNode<T> {
    data: T;
    children: DefTreeNode<T>[];
}

export interface DefTree<T> {
    root: DefTreeNode<T> | null;
    size: number;
    
    addChild(parentData: T, childData: T): boolean;
    removeChild(data: T): void;
}