import React, { useState } from 'react';
import "./Collapsible.css";

type CollapsibleProps = {
  title: string;
};

const Collapsible: React.FC<CollapsibleProps> = (props) => {
  const { title } = props;
  const [isCollapsed, setIsCollapsed] = useState(true);

  function handleToggle() {
    setIsCollapsed(!isCollapsed);
  }

  return (
    <div className="my-4">
      <div className="collapse-button" onClick={handleToggle}>
        <i className={`codicon codicon-chevron-${isCollapsed ? 'right' : 'down'}`}></i>
        <label className="form-label">{title}</label>
      </div>
      {isCollapsed ? null : props.children}
    </div>
  );
};

export default Collapsible;
