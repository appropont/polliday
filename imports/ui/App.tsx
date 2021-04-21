import React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";

import { Home } from "./pages/Home";
import { Edit } from "./pages/Edit";
import { Vote } from "./pages/Vote";
import { Results } from "./pages/Results";

import "./styles/variables.css";
import "./App.css";
import "./styles/buttons.css";
import "./styles/headings.css";
import "./styles/inputs.css";
import "./styles/lists.css";
// import "./styles/pages/results.css";

export const App = () => (
  <div>
    <h2 className="logo">🍹DoppleStraw</h2>
    <BrowserRouter>
      <Switch>
        <Route path="/" exact={true}>
          <Home></Home>
        </Route>

        <Route path="/:pollId/edit">
          <Edit></Edit>
        </Route>

        <Route path="/:pollId/vote">
          <Vote></Vote>
        </Route>

        <Route path="/:pollId/results">
          <Results></Results>
        </Route>
      </Switch>
    </BrowserRouter>
  </div>
);
