import NetworkGraph from "./components/NetworkGraph"
import data from "./data/graph"

import "./app.css"

const App = () => {
  return (
    <>
      <header>
          <h1>🔍XGress</h1>
      </header>
      <div>
        <NetworkGraph width={window.screen.availWidth} height={window.screen.availHeight + 50} graph={data} />
      </div>
    </>
  )
}

export default App