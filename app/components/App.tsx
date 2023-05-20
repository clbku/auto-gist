import React from 'react';

import "./App.css";

import { ConventionCommit } from './ConventionCommit/ConventionCommit';
import { AutoVersioning } from "./AutoVersioning/AutoVersioning";
import { GitGraph } from './GitGraph/GitGraph';

export const App = () => {

  const renderApp = () => {
    switch (appType) {
      case "auto-versioning":
        return <AutoVersioning />;
      case "convention-commit":
        return <ConventionCommit />;
      case "git-graph":
        return <GitGraph />;
    }
  };

  return (
    <>
      {renderApp()}
    </>
  );
};
