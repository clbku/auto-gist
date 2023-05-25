import './Col.css';
type ColProps = {
    children: any,
    className: string
};

export const Col:React.FC<ColProps> = (props) => {

    const {className} = props;

    return (
        <div className={`col ${className}`}>
            {props.children}
        </div>
    );
};