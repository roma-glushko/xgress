import json
from pathlib import Path
from typing import Optional, Set, Any
from uuid import uuid4, UUID

import typer
import asyncio
import yaml
from pydantic import BaseModel, Field

app = typer.Typer()

Labels = dict[str, str]


def labels_to_str(labels: Labels) -> str:
    return ",".join([f"{label}={value}" for label, value in labels.items()])


def get_k8s_id(namespace: Optional[str], labels: Labels) -> str:
    namespaceStr = namespace if namespace else "*"

    return f"{namespaceStr}/{labels_to_str(labels)}"


class ExternalService(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    name: Optional[str] = None
    cidr: str


class Service(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    name: Optional[str] = None
    namespace: Optional[str]
    labels: Labels = Field(default_factory=dict)
    ports: Set[str] = Field(default_factory=set)

    ingress: list["Service"] = Field(default_factory=list)
    egress: list["Service"] = Field(default_factory=list)


def get_name_from_labels(labels: Labels) -> Optional[str]:
    for label_key in ("component", "kubernetes.io/metadata.name", "app.kubernetes.io/name"):
        if label_key in labels:
            return labels[label_key]

    return None


def get_namespaces_name(namespace_rule: dict[str, Any], default_name: Optional[str] = None) -> Optional[str]:
    namespace_selector = namespace_rule.get("namespaceSelector", None)

    if namespace_selector is None:
        return default_name

    if namespace_labels := namespace_selector.get("matchLabels"):
        return get_name_from_labels(namespace_labels)

    # if namespaceSelector is {} then the namespace is all
    return None


def generate_graph(service_map: dict[str, Service]) -> dict[str, Any]:
    namespaces: dict[str, int] = {}
    nodes: list[dict[str, Any]] = []
    links: list[dict[str, Any]] = []
    last_namespace_num: int = 1

    for service_id, service in service_map.items():
        if service.namespace in {"observability"}:
            continue

        if "k8s-app" in service.labels:
            continue

        service_name = service.name or service_id
        namespace = service.namespace
        group = namespaces.get(namespace) if namespace else 0

        if group is None:
            namespaces[namespace] = last_namespace_num
            group = last_namespace_num

            last_namespace_num += 1

        nodes.append({
            "id": service_name,
            "group": group,
        })

        for egress_service in service.egress:
            if egress_service.namespace in {"observability"}:
                continue

            if "k8s-app" in egress_service.labels:
                continue

            egress_service_name = egress_service.name or get_k8s_id(egress_service.namespace, egress_service.labels)

            links.append({
                "source": service_name,
                "target": egress_service_name,
                "value": 1,
            })

    return {
        "nodes": nodes,
        "links": links,
    }

async def parse(path: Path):
    # TODO: account for directory full of k8s resources
    #  and individual file with one or few resource def inside

    services: dict[str, Service] = {}

    try:
        with open(path, mode='r') as f:
            try:
                resources = yaml.safe_load_all(f)

                if not resources:
                    print("no resources")
                    return

                for resource in resources:
                    if not resource:
                        continue

                    if "kind" not in resource or "apiVersion" not in resource or "metadata" not in resource or "spec" not in resource:
                        print("not a k8s resource, skipping")
                        continue

                    metadata = resource.get("metadata")
                    spec = resource.get("spec")

                    pod_namespace = metadata.get("namespace", "default")
                    pod_selector = spec.get("podSelector")
                    pod_labels = pod_selector.get("matchLabels", {})

                    service = Service(
                        name=get_name_from_labels(pod_labels),
                        namespace=pod_namespace,
                        labels=pod_labels
                    )

                    services[get_k8s_id(pod_namespace, pod_labels)] = service

                    for rule in spec.get("ingress", []):
                        for ingressFrom in rule.get("from"):
                            ingress_pod_labels: Labels = {}

                            if ingress_pod_selector := ingressFrom.get("podSelector"):
                                ingress_pod_labels = ingress_pod_selector.get("matchLabels")

                            ingress_namespace = get_namespaces_name(ingressFrom, default_name=pod_namespace)

                            service_id = get_k8s_id(ingress_namespace, ingress_pod_labels)
                            ingress_service = services.get(service_id)

                            if not ingress_service:
                                ingress_service = Service(
                                    name=get_name_from_labels(ingress_pod_labels),
                                    namespace=ingress_namespace,
                                    labels=ingress_pod_labels
                                )

                                services[service_id] = ingress_service

                            service.ingress.append(ingress_service)

                    for rule in spec.get("egress", []):
                        for egressTo in rule.get("to"):
                            if "ipBlock" in egressTo:
                                # don't count on cidrs yet
                                # use ExternalService
                                continue

                            egress_pod_labels: Labels = {}

                            if egress_pod_selector := egressTo.get("podSelector"):
                                egress_pod_labels = egress_pod_selector.get("matchLabels")

                            egress_namespace = get_namespaces_name(egressTo, default_name=pod_namespace)

                            service_id = get_k8s_id(egress_namespace, egress_pod_labels)
                            egress_service = services.get(service_id)

                            if not egress_service:
                                egress_service = Service(
                                    name=get_name_from_labels(ingress_pod_labels),
                                    namespace=egress_namespace,
                                    labels=egress_pod_labels,
                                )
                                services[service_id] = egress_service

                            service.egress.append(egress_service)

            except yaml.YAMLError as e:
                print(e)

        with open("./graph.json", "w") as file:
            graph = generate_graph(services)
            file.writelines(json.dumps(graph))

    except OSError as e:
        print(e)  # TODO: use logger

@app.command()
def main(path: str = "/Users/roman.hlushko/projects/ideas/xgress/tmp/policies.yaml"):
    asyncio.run(parse(Path(path)))


if __name__ == "__main__":
    app()
