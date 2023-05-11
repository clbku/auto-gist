import React from 'react';
import { VSCodeButton, VSCodeCheckbox, VSCodeDropdown, VSCodeOption, VSCodeRadio, VSCodeRadioGroup, VSCodeTextArea, VSCodeTextField } from "@vscode/webview-ui-toolkit/react";
import { useState } from "react";
import { CommonMessage } from '../../../src/type';

const CONVENTION_TYPE = ["fix", "feat", "docs", "style", "refactor", "perf", "build", "ci", "chore", "revert"];

export const AutoVersioning = () => {
  const [version, setVersion] = useState('');
  const [autoTag, setAutoTag] = useState(false);

  const handleGenerate = () => {
    vscode.postMessage<CommonMessage>({
      type: "COMMON",
      payload: { version, autoTag }
    });
  };

  return <>
    <div className="my-2">
      <label className="form-label">Build version</label>
      <VSCodeTextField onChange={(e: any) => setVersion(e.target.currentValue)} className='w-100' />
    </div>
    <div className="my-2" style={{ display: "flex", alignItems: "center" }}>
      <label style={{ marginRight: 4 }} className='form-label'>Auto tag?</label>
      <VSCodeCheckbox
        checked={autoTag}
        onChange={() => setAutoTag(!autoTag)}
      />
    </div>

    <VSCodeButton onClick={handleGenerate} className="w-100">Generate change log</VSCodeButton>
  </>;
};