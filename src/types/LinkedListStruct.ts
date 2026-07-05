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

export interface DefDoublyLinkedListNode<T> {
    data: T;
    next: DefDoublyLinkedListNode<T> | null;
    prev: DefDoublyLinkedListNode<T> | null;
}

export interface DefDoublyLinkedList<T> {
    head: DefDoublyLinkedListNode<T> | null;
    tail: DefDoublyLinkedListNode<T> | null;
    circular: boolean;
    size: number;
    insertAtHead(data: T): void;
    insertAtIndex(index: number, data: T): boolean;
    insertAtTail(data: T): void;
    deleteByIndex(index: number): boolean;
    deleteByValue(value: T): void;
    toArray(data: T): T[];
}