import React, { useState } from 'react';
import "./Collapsible.css";
import { IconButton } from '../Button/Button';

type CollapsibleAction = {
  icon: string,
  onClick: () => void
};
type CollapsibleProps = {
  title: string;
  collapsed?: boolean,

  actions?: CollapsibleAction[]
};

const Collapsible: React.FC<CollapsibleProps> = (props) => {
  const { title, collapsed = true, actions = [] } = props;
  const [isCollapsed, setIsCollapsed] = useState(collapsed);

  function handleToggle() {
    setIsCollapsed(!isCollapsed);
  }

  return (
    <div className="m-4">
      <div className="w-100">
        <div className="collapse-button" onClick={handleToggle}>
          <div className="w-100 collapse-button__title">
            <i className={`codicon codicon-chevron-${isCollapsed ? 'right' : 'down'}`}></i>
            <label className="form-label">{title}</label>
          </div>
          {actions && (
            <div className="collapse-button__actions">
              {
                actions.map(action => (
                  <IconButton icon={action.icon} onClick={action.onClick}></IconButton>
                ))
              }
            </div>
          )}
        </div>
        {isCollapsed ? null : props.children}
      </div>
    </div>
  );
};

export default Collapsible;
