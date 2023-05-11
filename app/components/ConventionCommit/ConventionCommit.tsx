import React from 'react';
import { VSCodeButton, VSCodeCheckbox, VSCodeDropdown, VSCodeOption, VSCodeRadio, VSCodeRadioGroup, VSCodeTextArea, VSCodeTextField } from "@vscode/webview-ui-toolkit/react";
import { useState } from "react";
import { CommonMessage } from '../../../src/type';
import Collapsible from '../Collapsible/Collapsible';

const CONVENTION_TYPE = ["fix", "feat", "docs", "style", "refactor", "perf", "build", "ci", "chore", "revert"];

export const ConventionCommit = () => {
  const [convention, setConvention] = useState<any>({ type: 'fix', isBreaking: false });

  const handleConventionPropChange = (key: string) => (e: any) => {
    setConvention({
      ...convention,
      [key]: e.target.currentValue
    });
  };

  const handleCommit = () => {
    vscode.postMessage<CommonMessage>({
      type: "COMMON",
      payload: convention
    });
  };

  return <>
    <div className="my-2">
      <label className="form-label">Type</label>
      <VSCodeDropdown onChange={handleConventionPropChange("type")} className="w-100">
        {
          CONVENTION_TYPE.map(value => (
            <VSCodeOption key={value} value={value}>{value.charAt(0).toUpperCase() + value.slice(1)}</VSCodeOption>
          ))
        }
      </VSCodeDropdown>
    </div>
    <div className="my-2">
      <label className="form-label">Scope</label>
      <VSCodeTextField onChange={handleConventionPropChange("scope")} className='w-100' />
    </div>
    <div className="my-2">
      <label className="form-label">Subject</label>
      <VSCodeTextField onChange={handleConventionPropChange("subject")} className='w-100' />
    </div>

    <div className="my-2" style={{ display: "flex", alignItems: "center" }}>
      <label style={{ marginRight: 4 }} className='form-label'>Is breaking change?</label>
      <VSCodeCheckbox
        checked={convention.isBreaking}
        onChange={() => setConvention({ ...convention, isBreaking: !convention.isBreaking })}
      />
    </div>


    <Collapsible title='Advance'>
      <div className="my-2">
        <label className="form-label">Description</label>
        <VSCodeTextArea onChange={handleConventionPropChange("description")} className='w-100' rows={3} />
      </div>
      <div className="my-2">
        <label className="form-label">Link to project management software:</label>
        <VSCodeDropdown onChange={handleConventionPropChange("linkTo")} className="w-100">
          {
            ['None', 'Jira', 'Mantis'].map(value => (
              <VSCodeOption key={value}>{value}</VSCodeOption>
            ))
          }
        </VSCodeDropdown>
      </div>
      {
        (convention.linkTo && convention.linkTo !== 'None' && (
          <div className="my-2">
            <label className="form-label">Ticket id</label>
            <VSCodeTextField onChange={handleConventionPropChange("ticketId")} className='w-100' />
          </div>
        ))
      }
    </Collapsible>

    <VSCodeButton onClick={handleCommit} className="w-100">Commit</VSCodeButton>
  </>;
};