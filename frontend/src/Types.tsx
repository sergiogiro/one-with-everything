
interface Item {
    title: string;
    description: string;
    completed: boolean;
}

interface ItemWithId extends Item {
    id: string;
}

export type {Item, ItemWithId} ;
