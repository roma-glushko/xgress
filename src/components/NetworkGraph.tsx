import * as d3 from "d3";
import { Component, RefObject, createRef } from 'preact'
import "/@/components/NetworkGraph.css"
import {GraphData, NodeData} from "/@/data/types"
import Nodes from "/@/components/Nodes";
import Links from "/@/components/Links";
import Labels from "/@/components/Labels";
import Namespaces, { createNamespaces, NamespaceData } from "/@/components/Namespaces";


interface Props {
    width: number
    height: number
    graph: GraphData
}

export type Svg = d3.Selection<
  SVGSVGElement,
  undefined,
  HTMLElement,
  undefined
>

export type Canvas = d3.Selection<
  SVGGElement,
  undefined,
  HTMLElement,
  undefined
>

class NetworkGraph extends Component<Props> {
    svgRef: RefObject<SVGSVGElement>;
    canvasRef: RefObject<SVGGElement>;

    svg: Svg;
    canvas: Canvas;

    namespaces: NamespaceData[]

    colorScheme: any;

    force: any;

    constructor(props: Props) {
        super(props);

        this.colorScheme = d3.scaleOrdinal(d3.schemePaired)

        this.svgRef = createRef();
        this.canvasRef = createRef();

        this.svg = d3.select(this.svgRef.current)
        this.canvas = d3.select(this.canvasRef.current)

        const { width, height, graph } = this.props

        this.force = d3.forceSimulation()
          .force('link', d3.forceLink().id((d: any) => d.id).distance(150))
          .force('charge', d3.forceManyBody<NodeData>().strength(-500))
          .force('x', d3.forceX<NodeData>(width / 2))
          .force('y', d3.forceY(height / 2))

        this.state = {
            namespaces: []
        }
    }

     componentDidMount() {
        const node = d3.selectAll(".node");
        const link = d3.selectAll(".link");
        const label = d3.selectAll(".label");

        const {graph} = this.props

        const ticked = () => {

          link
            .attr("x1", function (d: any) {
              return d?.source?.x;
            })
            .attr("y1", function (d: any) {
              return d?.source?.y;
            })
            .attr("x2", function (d: any) {
              return d?.target?.x;
            })
            .attr("y2", function (d: any) {
              return d?.target?.y;
            });

          node
            .attr("cx", function (d: any) {
              return d?.x;
            })
            .attr("cy", function (d: any) {
              return d?.y;
            });

          label
            .attr("x", function (d: any) {
              return (d?.x || 0) + 10;
            })
            .attr("y", function (d: any) {
              return (d?.y || 0) + 4;
            });

          this.setState({namespaces: createNamespaces(graph.nodes)})
        }

        this.force.nodes(graph.nodes).on("tick", ticked);
        this.force.force("link").links(graph.links);

        this.canvas.call(d3.zoom<SVGGElement, undefined>().on("zoom", (event) => {
            this.canvas.attr("transform", `translate(${event.translate}) scale(${event.scale})`);
        }))
      }

    render(props: any, state: any) {
        const {width, height, graph} = this.props

        return (
          <div className="container" >
              <svg className="canvas" ref={this.svgRef} width={width} height={height} pointer-events="all" viewBox={`0 0 ` + width + " " + height}>
                <g ref={this.canvasRef}>
                    <Links links={graph.links} />
                    <Namespaces namespaces={state.namespaces} colorScheme={this.colorScheme} />
                    <Nodes nodes={graph.nodes} colorScheme={this.colorScheme} simulation={this.force} />
                    <Labels nodes={graph.nodes} />
                </g>
              </svg>
          </div>
        )
    }

}

export default NetworkGraph