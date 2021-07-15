import React from "react";
import "./App.css";

import Grid from "./modules/grid";

function App() {
  return (
    <div>
      <Grid width={600} height={400} borderRatio={0.2} columns={3} rows={2} />
    </div>
  );
}

export default App;
