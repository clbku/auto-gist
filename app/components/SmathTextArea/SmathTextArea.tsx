import { VSCodeTextArea } from '@vscode/webview-ui-toolkit/react';

type SmartTextAreaProp = {
    minRows: number
    onChange: (value: string) => void
};

export const SmartTextArea: React.FC<SmartTextAreaProp> = (props) => {
    const {minRows} = props;
    const {onChange} = props;

    const handleChangeInput = (e: any) => {

        e.target.control.style.height = 'auto';
        e.target.control.style.height = `${e.target.control.scrollHeight + 10}px`;

        onChange(e.target.currentValue) ;
    };

    return (
        <VSCodeTextArea className='smart-textarea w-100' rows={minRows} onInput={handleChangeInput}/>
    );
};