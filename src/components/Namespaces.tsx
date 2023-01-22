import { FunctionalComponent } from "preact"
import { useRef, useEffect } from "preact/hooks"
import * as d3 from "d3";
import { NodeData } from "/@/data/types"

type NamespaceID = number | string
type NodePoint = [number, number]

export interface NamespaceData {
    id: NamespaceID
    name: string
    hull: any
}


export const createNamespaces = (nodes: NodeData[], hullOffset: number = 15): NamespaceData[] => {
    const namespacePoints = new Map<NamespaceID, NodePoint[]>()

    nodes.forEach((node) => {
        const namespaceId = node.group

        if (!namespacePoints.has(namespaceId)) {
            namespacePoints.set(namespaceId, [])
        }

        const points = namespacePoints.get(namespaceId) as NodePoint[]

        points.push([node.x - hullOffset, node.y - hullOffset]);
        points.push([node.x - hullOffset, node.y + hullOffset]);
        points.push([node.x + hullOffset, node.y - hullOffset]);
        points.push([node.x + hullOffset, node.y + hullOffset]);
    })

    const namespaces: NamespaceData[] = []

    namespacePoints.forEach((points, namespaceId) => {
        namespaces.push({
            id: namespaceId,
            name: namespaceId.toString(),
            hull: d3.polygonHull(points)
        })
    })

    return namespaces
}

interface NamespaceProps {
    namespace: NamespaceData
    colorScheme: any
}

const Namespace: FunctionalComponent<NamespaceProps> = ({namespace, colorScheme}: NamespaceProps) => {
    const namespaceRef = useRef<SVGPathElement>(null)

    const pen = d3.line().curve(d3.curveCardinalClosed.tension(.75))

    useEffect(() => {
        d3.select(namespaceRef.current).datum(namespace.hull)
    }, [namespace]);

    return <path
        ref={namespaceRef}
        className="namespace"
        fill={colorScheme(namespace.id.toString())}
        d={pen(namespace.hull)}
        onclick={() => console.log("Selected Namespace: ", namespace.id)}
    />;
}

interface NamespacesProps {
    namespaces: NamespaceData[]
    colorScheme: any
}

const Namespaces: FunctionalComponent<NamespacesProps> = ({namespaces, colorScheme}: NamespacesProps) => {
    const namespaceNodes = namespaces?.map((namespace: NamespaceData, index: number) => {
      return <Namespace key={index} namespace={namespace} colorScheme={colorScheme} />
    });

    return (
      <g className="namespaces">
        {namespaceNodes}
      </g>
    );
}

export default Namespaces