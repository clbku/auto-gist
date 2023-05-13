import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react"

type TextFieldProps = {
    className: string,
    onChange: (e: any) => void
}

export const TextField:React.FC<TextFieldProps> = (props) => {

    const {className} = props;
    const {onChange} = props

    return (
        <VSCodeTextField className={className} onChange={onChange}/>
    );
};