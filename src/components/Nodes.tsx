import { FunctionalComponent } from "preact"
import { useRef, useEffect } from "preact/hooks"
import * as d3 from "d3";
import { NodeData } from "/@/data/types"

interface NodeProps {
    node: NodeData
    color: string
    radius: number
}

const Node: FunctionalComponent<NodeProps> = ({node, radius, color}: NodeProps) => {
    const nodeRef = useRef<SVGCircleElement>(null)

    useEffect(() => {
        d3.select(nodeRef.current).data([node]);
    }, [node, nodeRef]);

    return (
      <circle ref={nodeRef} className="node" r={radius} fill={color}>
        <title>{node.id}</title>
      </circle>
    );
}

interface NodesProps {
    nodes: NodeData[]
    colorScheme: any
    simulation: any // TODO: figure out the concrete class here
}

const Nodes: FunctionalComponent<NodesProps> = ({nodes, colorScheme, simulation}: NodesProps) => {
    const graphNodes = nodes.map((node: NodeData, index: number) => {
      return <Node key={index} node={node} radius={6} color={colorScheme(node.group.toString())} />
    })

    useEffect(() => {
        const onDragStart = (event: any, d: any) => {
          if (!event.active) {
            simulation.alphaTarget(0.3).restart();
          }

          d.fx = d.x;
          d.fy = d.y;
        }

        const onDrag = (event: any, d: any) => {
          d.fx = event.x;
          d.fy = event.y;
        }

        const onDragEnd = (event: any, d: any) => {
          if (!event.active) {
            simulation.alphaTarget(0);
          }
          d.fx = null;
          d.fy = null;
        }

        d3.selectAll(".node")
          .call(d3.drag()
            .on("start", onDragStart)
            .on("drag", onDrag)
            .on("end", onDragEnd));

    }, [simulation]);


    return (
        <g className="nodes">
            {graphNodes}
        </g>
    );
}

export default Nodes