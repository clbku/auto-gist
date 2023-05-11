import "./App.css";
import React from 'react';
import { ConventionCommit } from './ConventionCommit/ConventionCommit';
import { AutoVersioning } from "./AutoVersioning/AutoVersioning";

export const App = () => {

  return (
    <>
      {
        appType === 'convention-commit' ? <ConventionCommit /> : <AutoVersioning />
      }
    </>
  );
};
