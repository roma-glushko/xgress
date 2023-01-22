import { FunctionalComponent } from "preact"
import { useRef, useEffect } from "preact/hooks"
import * as d3 from "d3";
import { NodeData } from "/@/data/types"

interface NamespaceProps {
    node: NodeData
    colorScheme: any
}

const Namespace: FunctionalComponent<NamespaceProps> = ({node, colorScheme}: NamespaceProps) => {
    const namespaceRef = useRef<SVGPathElement>(null)

    useEffect(() => {
        d3.select(namespaceRef.current).data([node]);
    }, [node, namespaceRef]);

    const hullPen = d3.line().curve(d3.curveCardinalClosed.tension(.85))

    return <path ref={namespaceRef} className="namespace" d={hullPen()} fill={colorScheme()} onclick={} />;
}

interface NamespacesProps {
    nodes: NodeData[]
    colorScheme: any
}

// function convexHulls(nodes, offset) {
//   var hulls = {};
//
//   // create point sets
//   for (var k=0; k<nodes.length; ++k) {
//     var n = nodes[k];
//     if (n.size) continue;
//     var i = getGroup(n),
//         l = hulls[i] || (hulls[i] = []);
//     l.push([n.x-offset, n.y-offset]);
//     l.push([n.x-offset, n.y+offset]);
//     l.push([n.x+offset, n.y-offset]);
//     l.push([n.x+offset, n.y+offset]);
//   }
//
//   // create convex hulls
//   var hullset = [];
//   for (i in hulls) {
//     hullset.push({group: i, path: d3.geom.hull(hulls[i])});
//   }
//
//   return hullset;
// }

const Namespaces: FunctionalComponent<NamespacesProps> = ({nodes, colorScheme}: NamespacesProps) => {
    const namespaceNodes = nodes.map((node: NodeData, index: number) => {
      return <Namespace key={index} node={node} colorScheme={colorScheme} />;
    });

    return (
      <g className="namespaces">
        {namespaceNodes}
      </g>
    );
}

export default Namespaces