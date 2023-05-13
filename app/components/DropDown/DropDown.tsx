import { VSCodeDropdown, VSCodeOption } from "@vscode/webview-ui-toolkit/react"

export type DropDownOption = {
    key: string,
    value: string
};

type DropDownProps = {
    options: DropDownOption[],
    onChange: (e: any) => void,
    className: string
}

export const DropDown:React.FC<DropDownProps> = (props) => {

    const {options, className} = props;
    const {onChange} = props;

    return (
      <VSCodeDropdown className={className} onChange={onChange}>
        {
            options.map(option => (
                <VSCodeOption key={option.value} value={option.value}>{option.value.charAt(0).toUpperCase() + option.value.slice(1)}</VSCodeOption>
            ))}
      </VSCodeDropdown>
    );
};