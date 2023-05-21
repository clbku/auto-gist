import React from 'react';
import { VSCodeButton, VSCodeCheckbox, VSCodeDropdown, VSCodeOption, VSCodeRadio, VSCodeRadioGroup, VSCodeTextArea, VSCodeTextField } from "@vscode/webview-ui-toolkit/react";
import { useState } from "react";
import { CommonMessage } from '../../../src/type';
import { TextField } from '../TextField/TextField';
import { Checkbox } from '../Checkbox/Checkbox';
import { SmartTextArea } from '../SmathTextArea/SmathTextArea';
import {removeSpaces} from '../../../src/helpers/git';
import { Button } from '../Button/Button';

const CONVENTION_TYPE = ["fix", "feat", "docs", "style", "refactor", "perf", "build", "ci", "chore", "revert"];

export const AutoVersioning = () => {
  const [version, setVersion] = useState('');
  const [autoTag, setAutoTag] = useState(false);
  const [filter, setFilter] = useState('');

  const handleGenerate = () => {
    vscode.postMessage<CommonMessage>({
      type: "COMMON",
      payload: { version, autoTag, filter }
    });
  };

  const handleCheckbox = () => {
    setAutoTag(!autoTag);
  };

  const handleChangeInput = (e: any) => {

    const filterList = e.target.value;

    handleChange(filterList);
  };

  const handleChange = (list: any) => {
    console.log(list.split('\n'));
    let result: any= [];
    for (const key of list.split('\n')) {
      const words = key.split("-");
      const firstWord = words.shift();
      if (!firstWord) { return "";}
      const remainingWords = words.map((word: string) => word.charAt(0).toUpperCase() + word.slice(1));
      result.push(firstWord.toLowerCase() + remainingWords.join(""));
    }
    console.log(result);
    setFilter(result);

  };

  return <>
    <div className="my-2">
      <label className="form-label">Build version</label>
      <TextField className={'w-100'} onChange={e => setVersion(e.target.currentValue)} />
    </div>
    <div className="my-2" style={{ display: "flex", alignItems: "center" }}>
      <label style={{ marginRight: 4 }} className='form-label'>Auto tag?</label>
      <Checkbox isBreaking={autoTag} onChange={handleCheckbox} />
    </div>
    
    <div className="my-2">
        <label className="form-label">Footer Filter</label>
        <SmartTextArea minRows={2} onChange={handleChangeInput}/>
    </div>
    {/* <VSCodeButton onClick={handleGenerate} className="w-100">Generate change log</VSCodeButton> */}
    <Button onClick={handleGenerate} className={'w-100'}/>
  </>;
};
