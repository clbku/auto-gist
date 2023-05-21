import React, { useEffect } from 'react';
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
import { FileItem } from './FileItem';

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

type FileStatus = { status: string, fileName: string, isStaged: boolean };

export const ConventionCommit = () => {
  const [convention, setConvention] = useState<any>({ type: 'fix', isBreaking: false, footerGen: ''});
  const [fileChanges, setFileChanges] = useState<FileStatus[]>([]);

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
    console.log(convention);
  };

  const handleOnChange = () => {
    setConvention({
      ...convention,
      isBreaking: !convention.isBreaking
    });
  };

  useEffect(() => {
    vscode.postMessage<CommonMessage>({
      type: "startup",
      payload: {}
    });

    window.addEventListener('message', (e) => {
      if (e.data.type === 'git-status') {
        setFileChanges(e.data.statuses.filter((status: FileStatus) => status.status !== ''));
      }
    });
  }, []);

  const handleStageChanges = (fileName?: string) => {
    vscode.postMessage<CommonMessage>({
      type: "stage-changes",
      payload: {
        fileName
      }
    });
  };

  const handleUnStageChanges = (fileName?: string) => {
    vscode.postMessage<CommonMessage>({
      type: "unstage-changes",
      payload: {
        fileName
      }
    });
  };

  const handleDiscardChanges = (fileName?: string) => {
    vscode.postMessage<CommonMessage>({
      type: "discard-changes",
      payload: {
        fileName
      }
    });
  };

  const stagedChanges = fileChanges.filter(change => change.isStaged);
  const unstageChanges = fileChanges.filter(change => !change.isStaged);

  return <>
    <div className="m-4">
      <label className="form-label">Type</label>
      <DropDown options={options} onChange={handleConventionPropChange('type')} className={'w-100'} />
    </div>
    <div className="m-4">
      <label className="form-label">Scope</label>
      <TextField className={'w-100'} onChange={handleConventionPropChange('scope')} />
    </div>
    <div className="m-4">
      <label className="form-label">Subject</label>
      <TextField className={'w-100'} onChange={handleConventionPropChange('subject')} />
    </div>

    <div className="m-4" style={{ display: "flex", alignItems: "center" }}>
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
    <div className="w-100 px-4">
      <Button onClick={handleCommit} className='w-100' text="Commit" />
    </div>

    {stagedChanges.length > 0 && (
      <Collapsible
        title={`Staged Changes (${stagedChanges.length})`}
        collapsed={false}
        actions={[{
          icon: 'remove',
          onClick: () => handleUnStageChanges()
        }]}
      >
        {fileChanges.map(change => change.isStaged && (
          <FileItem {...change} onUnstageChanges={handleUnStageChanges} />
        ))}
      </Collapsible>
    )}

    {
      unstageChanges.length > 0 && (
        <Collapsible
          title={`Changes (${unstageChanges.length})`}
          collapsed={false}
          actions={[
            {
              icon: "discard",
              onClick: () => handleDiscardChanges()
            },
            {
              icon: "plus",
              onClick: () => handleStageChanges()
            },
          ]}
        >
          {fileChanges.map(change => !change.isStaged && (
            <FileItem
              {...change}
              onStageChanges={handleStageChanges}
              onDiscardChanges={handleDiscardChanges}
            />
          ))}
        </Collapsible>
      )
    }
  </>;
};