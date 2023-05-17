import { SimulationNodeDatum } from 'd3'

export interface NodeData extends SimulationNodeDatum {
    id: string
    group: number

    x?: number
    y?: number
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

