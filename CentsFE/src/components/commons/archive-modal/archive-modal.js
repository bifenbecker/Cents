import React, {useCallback} from "react";
import Modal from "../modal/modal";

function ArchiveModal({archiveService, from, isDeleted, toggleArchiveModal, error}) {
  const handleArchiveService = useCallback(() => {
    archiveService();
  }, [archiveService]);

  const handleToggleArchiveModal = useCallback(() => {
    toggleArchiveModal(false);
  }, [toggleArchiveModal]);

  return (
    <Modal isConfirmationPopup>
      <div className="archive-pop-up-container">
        <p>
          {`Are you sure you want to ${
            isDeleted ? "unarchive" : "archive"
          } this ${from}?`}
        </p>
        <div className="modal-buttons-container">
          <button
            className="btn-theme btn-transparent btn-rounded small-button"
            onClick={handleToggleArchiveModal}
          >
            CANCEL
          </button>
          <button
            className="btn-theme btn-rounded small-button"
            onClick={handleArchiveService}
          >
            {isDeleted ? "UNARCHIVE" : "ARCHIVE"}
          </button>
        </div>
        {error ? <div className="error-message">{error}</div> : null}
      </div>
    </Modal>
  );
}

export default ArchiveModal;
