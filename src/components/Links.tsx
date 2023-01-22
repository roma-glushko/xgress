import { FunctionalComponent } from "preact"
import { useRef, useEffect } from "preact/hooks"
import * as d3 from "d3";
import { LinkData } from "/@/data/types"

interface LinkProps {
    link: LinkData
}

const Link: FunctionalComponent<LinkProps> = ({link}: LinkProps) => {
  const linkRef = useRef<SVGLineElement>(null)

  useEffect(() => {
    d3.select(linkRef.current).data([link]);
  }, [link, linkRef]);

  return <line className="link" ref={linkRef} strokeWidth={Math.sqrt(link.value)} />;
}

interface LinksProps {
    links: LinkData[]
}

const Links: FunctionalComponent<LinksProps> = ({links}: LinksProps) => {
    const graphLinks = links.map((link: LinkData, index: number) => {
        return <Link key={index} link={link} />;
    });

    return (
        <g className="links">
            {graphLinks}
        </g>
    );
}

export default Links