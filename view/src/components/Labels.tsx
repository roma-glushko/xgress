import { FunctionalComponent } from "preact"
import { useRef, useEffect } from "preact/hooks"
import * as d3 from "d3";
import { NodeData } from "../data/types"

interface LabelProps {
    node: NodeData
}

const Label: FunctionalComponent<LabelProps> = ({node}: LabelProps) => {
    const labelRef = useRef<SVGTextElement>(null)

    useEffect(() => {
        d3.select(labelRef.current).data([node]);
    }, [node]);

    return <text className="label" ref={labelRef}>{node.id}</text>;
}

interface LabelsProps {
    nodes: NodeData[]
}

const Labels: FunctionalComponent<LabelsProps> = ({nodes}: LabelsProps) => {
    const nodeLabels = nodes.map((node: NodeData, index: number) => {
      return <Label key={index} node={node} />;
    });

    return (
      <g className="labels">
        {nodeLabels}
      </g>
    );
}

export default Labels