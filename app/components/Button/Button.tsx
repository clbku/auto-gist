import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { CSSProperties } from "react";

type ButtonProps = {
    style?: CSSProperties
    className?: string;
    title?: string;

    onClick: () => void,
};

type IconButtonProps = ButtonProps & {
    icon: string;
};

export const Button:React.FC<ButtonProps> = (props) => {
    return (
        <VSCodeButton {...props}>Commit</VSCodeButton>
    );
};

export const IconButton: React.FC<IconButtonProps> = (props) => {
    const { icon, ...rest } = props;
    const { onClick } = props;

    return (
        <VSCodeButton {...rest} onClick={onClick} appearance="icon">
            <i className={`codicon codicon-${icon}`}></i>
        </VSCodeButton>
    );
};