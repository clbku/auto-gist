import "./App.css";

import { ConventionCommit } from './ConventionCommit/ConventionCommit';
import { AutoVersioning } from "./AutoVersioning/AutoVersioning";

export const App = () => {

  const renderApp = () => {
    switch (appType) {
      case "auto-versioning":
        return <AutoVersioning />;
      case "convention-commit":
        return <ConventionCommit />;
    }
  };

  return (
    <>
      {renderApp()}
    </>
  );
};
