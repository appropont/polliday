import React from "react";
import { BrowserRouter, Switch, Route, Link } from "react-router-dom";

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
import "./styles/page.results.css";
import "./styles/page.edit.css";
import "./styles/page.vote.css";

document.title = "Polliday | Polls so easy its like a vacation";

export const App = () => (
  <div className="app-container">
    <BrowserRouter>
      <Link to="/" className="logo-link">
        <h2 className="logo">🍹Polliday</h2>
      </Link>
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
    <div className="footer">
      Source code available on <a href="https://github.com">Github</a>
    </div>
  </div>
);
