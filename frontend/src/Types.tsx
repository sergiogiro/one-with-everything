
interface Item {
    title: string;
    description: string;
    completed: boolean;
    depiction?: File | string;
}

interface ItemWithId extends Item {
    id: string;
}

export type {Item, ItemWithId} ;
