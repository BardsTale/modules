export interface dragNodeInfo {
    dragItem : object,
    fromDepth: number,
    toDepth: number,
}

export interface treeData {
    id: number,
    upperId: number,
    name: string,
    depth: number,
    children: treeData[]
}