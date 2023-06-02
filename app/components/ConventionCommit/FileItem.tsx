import { Button, IconButton } from "../Button/Button";
import "./FileItem.css";

type FileItemProps = {
  status: string
  fileName: string
  isStaged: boolean

  onStageChanges?: (fileName: string) => void
  onUnstageChanges?: (fileName: string) => void
  onDiscardChanges?: (fileName: string) => void
  onCompareChanges?: (fileName: string) => void
  onOpenFile?: (fileName: string) => void
};
export const FileItem: React.FC<FileItemProps> = (props) => {
  const { status, fileName, isStaged } = props;
  const { onStageChanges, onUnstageChanges, onDiscardChanges, onCompareChanges, onOpenFile } = props;

  const renderStatusTag = () => {
    return <div className={`file-item__status file-item__status--${status}`}>{status}</div>;
  };

  return (
    <div className="file-item">
      {renderStatusTag()}
      <div className="file-item__title">
        <span style={{ textDecoration: status === 'D' ? 'line-through' : '' }}>{"gitDecorationmodifiedResourceForeground"}</span>
      </div>
      <div className="file-item__actions">
        {onOpenFile && <IconButton icon="go-to-file" onClick={() => onOpenFile(fileName)} title="Open file" />}
        {onCompareChanges && <IconButton icon="git-compare" onClick={() => onCompareChanges(fileName)} title="Compare change" />}
        {onDiscardChanges && <IconButton icon="discard" onClick={() => onDiscardChanges(fileName)} title="Discard" />}
        {
          isStaged
            ? (onUnstageChanges && <IconButton icon="remove" onClick={() => onUnstageChanges(fileName)} title="Unstage Changes" />)
            : (onStageChanges && <IconButton icon="plus" onClick={() => onStageChanges(fileName)} title="Stage Changes" />)
        }
      </div>
    </div>
  );
};