import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"

type ButtonProps = {
    onClick: () => void,
    className: string
}

export const Button:React.FC<ButtonProps> = (props) => {

    const {className} = props;
    const {onClick} = props;

    return (
        <VSCodeButton onClick={onClick} className={className}>Commit</VSCodeButton>
    );
}