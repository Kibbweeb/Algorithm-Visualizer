import type { DefLinkedListNode, DefLinkedList } from "../types/LinkedListStruct";

class ListNodes<T> implements DefLinkedListNode<T> {
    data: T;
    next: ListNodes<T> | null;

    constructor(data: T, next: ListNodes<T> | null = null) {
        this.data = data;
        this.next = next;
    }
}

export class LinkedList<T> implements DefLinkedList<T> {
    head: DefLinkedListNode<T> | null = null;
    size: number = 0;

    insertAtHead(data: T): void {
        const newNode = new ListNodes(data);
        newNode.next = this.head;
        this.head = newNode;
        this.size++;
    }

    constructor() {
        const initValue = [27, 38, 51, 67, 89] as unknown as T[];

        for (const data of initValue) {
            this.insertAtHead(data);
        }
    }

    insertAtIndex(index: number, data: T): boolean {
        if (index < 0 || index > this.size) {
            return false;
        }

        if (index === 0){
            this.insertAtHead(data);
            return true;
        }

        let current = this.head;
        for (let i = 0; i < index - 1; i++){
            if (current) {
                current = current.next;
            }
        }

        if (current) {
            const newNode = new ListNodes(data);
            newNode.next = current.next;
            current.next = newNode;

            this.size++;
            return true;
        }
        return false;
    }

    insertAtTail(data: T): void {
        const newNode = new ListNodes(data);
        if (!this.head){
            this.head = newNode;
            this.size++;
            return;
        }

        let current = this.head;
        while (current.next){
            current = current.next;
        }

        current.next = newNode;
        this.size++;
    }

    deleteByIndex(index: number): boolean {
        if (index < 0 || index > this.size - 1) {
            return false;
        }

        if (this.head == null){
            return false;
        }

        if (index == 0){
            this.head = this.head.next;
            this.size--;
            return true;
        }

        let current = this.head;

        for (let i = 0; i < index - 1; i++){
            if (current && current.next){
                current = current.next;
            }
        }

        if (current && current.next){
            current.next = current.next.next;
            this.size--;
            return true;
        }
         return false;
    }

    deleteByValue(value: T): boolean {
        if (!this.head){
            return false;
        }

        if (this.head.data == value){
            this.head = this.head.next;
            return true;
        }

        let current = this.head;

        while (current.next){
            if (current.next.data === value){
                current.next = current.next.next
                this.size--;
                return true;
            }
            current = current.next;
        }

        return false;
    }

    toArray(): T[] {
        const result: T[] = [];

        let current = this.head;

        while (current){
           result.push(current.data);
           current = current.next;
        }
        return result;
    }

}