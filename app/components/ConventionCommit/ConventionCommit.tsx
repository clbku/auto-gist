import React from 'react';
import { VSCodeButton, VSCodeCheckbox, VSCodeDropdown, VSCodeOption, VSCodeRadio, VSCodeRadioGroup, VSCodeTextArea, VSCodeTextField } from "@vscode/webview-ui-toolkit/react";
import { useState } from "react";
import { CommonMessage } from '../../../src/type';
import Collapsible from '../Collapsible/Collapsible';
import { SmartTextArea} from '../SmathTextArea/SmathTextArea';
import { TextField } from '../TextField/TextField';
import { Checkbox } from '../Checkbox/Checkbox';
import { DropDownOption } from '../DropDown/DropDown';
import { DropDown } from '../DropDown/DropDown';
import { Button } from '../Button/Button';

const CONVENTION_TYPE = ["fix", "feat", "docs", "style", "refactor", "perf", "build", "ci", "chore", "revert"];
const CONVENTION_LINK = ['None', 'Jira', 'Mantis'];

const options: DropDownOption[] = CONVENTION_TYPE.map(option => ({
  key: option,
  value: option
}));

const linkOptions: DropDownOption[] = CONVENTION_LINK.map(option => ({
  key: option,
  value: option
}));

export const ConventionCommit = () => {
  const [convention, setConvention] = useState<any>({ type: 'fix', isBreaking: false, footerGen: ''});

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
    console.log(convention)
  };

  const handleOnChange = () => {
    setConvention({
      ...convention,
      isBreaking: !convention.isBreaking
    });
  };


  return <>
    <div className="my-2">
      <label className="form-label">Type</label>
      <DropDown options={options} onChange={handleConventionPropChange('type')} className={'w-100'} />
    </div>
    <div className="my-2">
      <label className="form-label">Scope</label>
      <TextField className={'w-100'} onChange={handleConventionPropChange('scope')} />
    </div>
    <div className="my-2">
      <label className="form-label">Subject</label>
      <TextField className={'w-100'} onChange={handleConventionPropChange('subject')} />
    </div>

    <div className="my-2" style={{ display: "flex", alignItems: "center" }}>
      <label style={{ marginRight: 4 }} className='form-label'>Is breaking change?</label>
      <Checkbox isBreaking={convention.isBreaking} onChange={handleOnChange} />
    </div>


    <Collapsible title='Advance'>
      <div className="my-2">
        <label className="form-label">Description</label>
        <SmartTextArea minRows={5} onChange={handleConventionPropChange('description')}/>
      </div>
      <div className="my-2">
        <label className="form-label">Link to project management software:</label>
        <DropDown options={linkOptions} onChange={handleConventionPropChange('linkTo')} className={'w-100'} />
      </div>
      {
        (convention.linkTo && convention.linkTo !== 'None' && (
          <div className="my-2">
            <label className="form-label">Ticket id</label>
            <TextField className={'w-100'} onChange={handleConventionPropChange('ticketId')} />
          </div>
        ))
      }
      <div className="my-2">
        <label className="form-label">Footer Generator</label>
        <SmartTextArea minRows={2} onChange={handleConventionPropChange('footerGen')}/>
      </div>
    </Collapsible>

    {/* <VSCodeButton onClick={handleCommit} className="w-100">Commit</VSCodeButton> */}
    <Button onClick={handleCommit} className={'w-100'}/>
  </>;
};