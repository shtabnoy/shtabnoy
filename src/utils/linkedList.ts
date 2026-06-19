type ListNode<T> = {
  value: T;
  next: ListNode<T> | null;
};

export class LinkedList<T> {
  private _head: ListNode<T> | null = null;
  private _size: number = 0;

  constructor() {}

  get head() {
    return this._head;
  }

  get size() {
    return this._size;
  }

  append(value: T) {
    const newNode = {
      value,
      next: null,
    };

    let node: ListNode<T> | null = this._head;
    while (node?.next) {
      node = node.next;
    }

    if (node) {
      node.next = newNode;
    } else {
      this._head = newNode;
    }

    this._size++;
  }

  prepend(value: T) {
    const newNode = {
      value,
      next: this._head,
    };

    this._head = newNode;
    this._size++;
  }

  deleteByValue(value: T): boolean {
    if (this._head?.value === value) {
      this._head = this._head?.next;
      this._size--;

      return true;
    }

    let node: ListNode<T> | null = this._head;
    while (node) {
      const nextNode = node.next;

      if (nextNode?.value === value) {
        node.next = nextNode.next;
        this._size--;

        return true;
      }
      node = node.next;
    }

    return false;
  }

  insertAt(index: number, value: T): boolean {
    if (index >= this.size) {
      return false;
    }

    if (index === 0) {
      this.prepend(value);
      return true;
    }

    let node = this._head;
    for (let i = 0; i < index - 1; i++) {
      node = node!.next;
    }

    const newNode = {
      value,
      next: node!.next,
    };
    node!.next = newNode;
    this._size++;
    return true;
  }

  toArray() {
    const arr: T[] = [];
    let node: ListNode<T> | null = this._head;

    while (node) {
      arr.push(node.value);
      node = node.next;
    }

    return arr;
  }

  reverse() {
    let prev = null;
    let node = this._head;

    while (node) {
      const nextNode = node.next;
      node.next = prev;
      prev = node;

      node = nextNode;
    }

    this._head = prev;
  }
}
