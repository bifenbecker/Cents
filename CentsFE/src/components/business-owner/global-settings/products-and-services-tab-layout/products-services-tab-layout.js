import React, {useState} from "react";
import TabSwitcher from "../../../commons/tab-switcher/tab-switcher";
import StatusIndicator from "../../../commons/statusIndicator/statusIndicator";
import {UncontrolledPopover} from "reactstrap";
import Modal from "../../../commons/modal/modal.js";

const TabLayout = (props) => {
  const [toggleThreeDotMenu, setToggleThreeDotMenu] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);

  const statusColors = {
    outOfStock: "#B00020",
    limitedStock: "#FF9900",
    inStock: "#3790F4",
  };

  const getStatus = () => {
    if (props.status === "Out of Stock") {return "outOfStock";}
    else if (props.status.includes("locations")) {return "limitedStock";}
    else {return "inStock";}
  };

  return (
    <>
      <div className="locations-card-header archived-text">
        <div className="location-header-container">
          <div className="product-header-row">
            <p>{props.product?.productName}</p>
            {props.product?.isDeleted && <div className="archive-label">Archived</div>}
          </div>
          <div
            className={`location-three-dot-menu ${toggleThreeDotMenu ? "open" : ""}`}
            id="three-dot-menu-locations"
          />
          <UncontrolledPopover
            trigger="legacy"
            placement="bottom-end"
            target="three-dot-menu-locations"
            isOpen={toggleThreeDotMenu}
            toggle={() => setToggleThreeDotMenu(!toggleThreeDotMenu)}
          >
            <p
              onClick={() => {
                setToggleThreeDotMenu(!toggleThreeDotMenu);
                setShowArchiveModal(true);
              }}
            >
              {props.product?.isDeleted ? "Unarchive product" : "Archive product"}
            </p>
          </UncontrolledPopover>
        </div>
      </div>
      <div className="locations-card-content p-and-s-tab-layout-card-content">
        <TabSwitcher
          tabs={props.tabs}
          activeTab={props.activeTab}
          onTabClick={props.onTabClick}
          disabled={props.product?.isDeleted}
        />

        <div className="active-tab-content-container">{props.activeComponent}</div>
      </div>
      <div className="p-and-s-tab-layout-card-footer">
        <StatusIndicator statusColors={statusColors} status={getStatus()} />
        <p>{props.status}</p>
      </div>
      {showArchiveModal && (
        <Modal>
          <div className="archive-modal">
            <p>
              Are you sure you want to{" "}
              {props.product?.isDeleted ? "unarchive" : "archive"} this product?
            </p>
            <div className="button-group">
              <div className="button-spacing">
                <button
                  type="submit"
                  className="btn-theme btn-rounded save-button secondary-button"
                  onClick={() => {
                    setShowArchiveModal(false);
                  }}
                >
                  CANCEL
                </button>
              </div>
              <div className="button-spacing">
                <button
                  type="submit"
                  className="btn-theme btn-rounded save-button primary-button"
                  onClick={() => {
                    if (props.product?.isDeleted) {
                      props.archiveProduct(props.product?.id, false);
                    } else {
                      props.archiveProduct(props.product?.id, true);
                    }
                    setShowArchiveModal(false);
                  }}
                >
                  {props.product?.isDeleted ? "UNARCHIVE" : "ARCHIVE"}
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default TabLayout;
