# XGress

Xgress is a tool that helps to visualize your microservice system based on networking policies you maintain.

## How to Run?

The current way of running is a little bit dirty, but it's fine for this stage of the project.

1. Run the Python script to generate service networking graph based on the network policy resources:

```python
python -m xgress policies.yaml
```

Where `policies.yaml` is a YAML file containing all policies. If you are using Helm you can easily generate such file via:

```bash
helm template test networking --values values.yaml --debug > policies.yaml
```

2. As a result, xgress script will generate a graph.json file in the xgress directory.
3. Use the content of that file and place it into `view/src/data/graph.ts`
4. Run the dashboard to see the service networking graph