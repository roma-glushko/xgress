
export interface NodeData {
    id: string
    group: number
}

export interface LinkData {
    source: string
    target: string
    value: number
}
export interface GraphData {
    nodes: NodeData[]
    links: LinkData[]
}

