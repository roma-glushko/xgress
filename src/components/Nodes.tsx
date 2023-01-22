import { FunctionalComponent } from "preact"
import { useRef, useEffect } from "preact/hooks"
import * as d3 from "d3";
import { NodeData } from "/@/data/types"

interface NodeProps {
    node: NodeData
    color: string
}

const Node: FunctionalComponent<NodeProps> = ({node, color}: NodeProps) => {
    const nodeRef = useRef<SVGCircleElement>(null)

    useEffect(() => {
        d3.select(nodeRef.current).data([node]);
    }, [node, nodeRef]);

    return (
      <circle className="node" r={5} fill={color} ref={nodeRef}>
        <title>{node.id}</title>
      </circle>
    );
}

interface NodesProps {
    nodes: NodeData[]
    simulation: any // TODO: figure out the concreat class here
}

const Nodes: FunctionalComponent<NodesProps> = ({nodes, simulation}: NodesProps) => {
     useEffect(() => {
        const onDragStart = (d: any) => {
          if (!d3.event.active) {
            simulation.alphaTarget(0.3).restart();
          }

          d.fx = d.x;
          d.fy = d.y;
        }

        const onDrag = (d: any) => {
          d.fx = d3.event.x;
          d.fy = d3.event.y;
        }

        const onDragEnd = (d: any) => {
          if (!d3.event.active) {
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

    const colorScheme = d3.scaleOrdinal(d3.schemeCategory10)
    const graphNodes = nodes.map((node: NodeData, index: number) => {
      return <Node key={index} node={node} color={colorScheme(node.group.toString())} />
    })

    return (
        <g className="nodes">
            {graphNodes}
        </g>
    );
}

export default Nodes