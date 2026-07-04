export interface DefLinkedListNode<T> {
    data: T;
    next: DefLinkedListNode<T> | null;
}

export interface DefLinkedList<T> {
    head: DefLinkedListNode<T> | null;
    size: number;
    insertAtHead(data: T): void;
    insertAtIndex(index: number, data: T): boolean;
    insertAtTail(data: T): void;
    deleteByIndex(index: number): boolean;
    deleteByValue(value: T): void;
    toArray(data: T): T[];
}