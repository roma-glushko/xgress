import * as d3 from "d3";
import { Component, RefObject, createRef } from 'preact'
import "/@/components/NetworkGraph.css"
import { GraphData } from "/@/data/types"
import Nodes from "/@/components/Nodes";
import Links from "/@/components/Links";
import Labels from "/@/components/Labels";


interface Props {
    width: number
    height: number
    graph: GraphData
}

class NetworkGraph extends Component<Props> {
    svg: RefObject<any>;
    canvas: any;

    graph: GraphData
    width: number;
    height: number;
    colorScheme: any;

    force: any;

    constructor(props: Props) {
        super(props);

        this.width = props.width
        this.height = props.height
        this.graph = props.graph

        this.colorScheme = d3.scaleOrdinal(d3.schemePaired)

        this.svg = createRef();
        this.canvas = d3.select(this.svg.current)

        this.force = d3.forceSimulation()
          .force('link', d3.forceLink().id((d: any) => d.id).distance(150))
          .force('charge', d3.forceManyBody().strength(-500))
          .force('x', d3.forceX(this.width / 2))
          .force('y', d3.forceY(this.height / 2))
    }

     componentDidMount() {
        const node = d3.selectAll(".node");
        const link = d3.selectAll(".link");
        const label = d3.selectAll(".label");

        const ticked = () => {
          link
            .attr("x1", function (d: any) {
              return d.source.x;
            })
            .attr("y1", function (d: any) {
              return d.source.y;
            })
            .attr("x2", function (d: any) {
              return d.target.x;
            })
            .attr("y2", function (d: any) {
              return d.target.y;
            });

          node
            .attr("cx", function (d: any) {
              return d.x;
            })
            .attr("cy", function (d: any) {
              return d.y;
            });

          label
            .attr("x", function (d: any) {
              return d.x + 10;
            })
            .attr("y", function (d: any) {
              return d.y + 4;
            });
        }

        this.force.nodes(this.graph.nodes).on("tick", ticked);
        this.force.force("link").links(this.graph.links);

        const redraw = (event) => {
            this.canvas.attr("transform", `translate(${event.translate}) scale(${event.scale})`);
        }

        this.canvas.call(d3.behavior.zoom().on("zoom", redraw))
      }

    render() {
        return (
          <div className="container" >
              <svg className="canvas" ref={this.svg} width={this.width} height={this.height} pointer-events="all" viewBox={`0 0 ` + this.width + " " + this.height}>
                <Links links={this.graph.links} />
                <Nodes nodes={this.graph.nodes} colorScheme={this.colorScheme} simulation={this.force} />
                <Labels nodes={this.graph.nodes} />
              </svg>
          </div>
        )
    }

}

export default NetworkGraph