import type { DefDoublyLinkedListNode, DefDoublyLinkedList } from "../types/LinkedListStruct";

class ListNodes<T> implements DefDoublyLinkedListNode<T> {
    data: T;
    next: ListNodes<T> | null;
    prev: ListNodes<T> | null;

    constructor(data: T, next: ListNodes<T> | null = null, prev: ListNodes<T> | null = null){
        this.data = data;
        this.next = next;
        this.prev = prev;
    }
}

export class DoublyLinkedList<T> implements DefDoublyLinkedList<T>{
    head: DefDoublyLinkedListNode<T> | null = null;
    tail: DefDoublyLinkedListNode<T> | null = null;
    circular: boolean = false;
    size: number = 0;

    insertAtHead(data: T): void {
        const newNode = new ListNodes(data);
        this.size++;
        
        if (!this.head){
            this.head = newNode;
            this.tail = newNode;

            if (this.circular){
                this.head.prev = this.tail;
                this.tail.next = this.head;
            }

            return;
        }
        if (this.circular){
            newNode.next = this.head;
            this.head.prev = newNode;
            this.head = newNode;
            this.head.prev = this.tail;
            if (this.tail) this.tail.next = this.head;
            return;
        } else {
            newNode.next = this.head;
            this.head.prev = newNode;
            this.head = newNode;
        }
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

        if (index === this.size){
            this.insertAtTail(data);
            return true;
        }

        let current = this.head;
        for (let i = 0; i < index - 1; i++){
            if (current) {
                current = current.next;
            }
        }

        if (current && current.next) {
            const newNode = new ListNodes(data);

            newNode.next = current.next;
            newNode.prev = current;
            current.next.prev = newNode;
            current.next = newNode;
            this.size++;

            return true;
        }
        return false;
    }

    insertAtTail(data: T): void {
        const newNode = new ListNodes(data);
        this.size++;

        if (!this.head || !this.tail){
            this.head = newNode;
            this.tail = newNode;

            if (this.circular){
                this.head.prev = this.tail;
                this.tail.next = this.head;
            }

            return;
        } 
        if (this.circular) {
            newNode.prev = this.tail;
            this.tail.next = newNode;
            this.tail = newNode;
            this.head.prev = this.tail;
            this.tail.next = this.head;
            return;
        } else {
            newNode.prev = this.tail;
            this.tail.next = newNode;
            this.tail = newNode;
        }
    }

    deleteByIndex(index: number): boolean {
        if (index < 0 || index > this.size - 1) {
            return false;
        }

        if (!this.head || !this.tail){
            return false;
        }

        if (this.size === 1){
            this.head = null;
            this.tail = null;
            this.size--;
            return true;
        }

        if (index === 0){
            this.head = this.head.next;
            this.size--;

            if (this.circular){
                if (this.head) this.head.prev = this.tail;
                if (this.tail) this.tail.next = this.head;
            } else {
                if (this.head) this.head.prev = null;
            }

            return true;
        }

        if (index === this.size - 1){
            this.tail = this.tail.prev;
            this.size--;

            if (this.circular){
                if (this.head) this.head.prev = this.tail;
                if (this.tail) this.tail.next = this.head;
            } else {
                if (this.tail) this.tail.next = null;
            }
            
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
            if (current.next) current.next.prev = current;
            this.size--;
            return true;
        }
         return false;
    }

    deleteByValue(value: T): boolean {
        let current = this.head;

        for (let i = 0; i < this.size; i++) {
            if (current && current.data === value) {
                return this.deleteByIndex(i);
            }
            if (current) current = current.next;
        }

        return false;
    }

    toArray(): T[] {
        const result: T[] = [];
        let current = this.head;

        for (let i = 0; i < this.size; i++) {
            if (current) {
                result.push(current.data);
                current = current.next;
            }
        }

        return result;
    }
}