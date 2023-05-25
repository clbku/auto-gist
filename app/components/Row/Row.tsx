import './Row.css';

type RowProps = {
    children: any,
    className: string
};

export const Row:React.FC<RowProps> = (props) => {  
    const {className} = props;
    return (
        <div className={className}>
            {props.children}
        </div>
    );
};