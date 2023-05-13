import { VSCodeCheckbox } from "@vscode/webview-ui-toolkit/react"

type CheckboxProps = {
    isBreaking: boolean,
    onChange: () => void
}

export const Checkbox:React.FC<CheckboxProps>= (props) => {

    const {isBreaking} = props;
    const {onChange} = props;


    return (
        <VSCodeCheckbox
            checked={isBreaking}
            onChange={onChange}
        />
    )
}