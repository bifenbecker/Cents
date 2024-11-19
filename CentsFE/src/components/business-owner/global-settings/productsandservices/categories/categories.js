// Package imports
import React, {useState, useEffect, useCallback} from "react";
import {sortBy} from "lodash";
import TextField from "../../../../commons/textField/textField";
import Modal from "../../../../commons/modal/modal";
import categoryIcon from "../../../../../assets/images/Icon_Product_Category_Side_Panel.svg";
import plusIcon from "../../../../../assets/images/Icon_Plus_Blue.svg";
import exitIcon from "../../../../../assets/images/Icon_Exit_Side_Panel.svg";

// Local component imports
import Card from "../../../../commons/card/card";
import TabSwitcher from "../../../../commons/tab-switcher/tab-switcher";
import BlockingLoader from "../../../../commons/blocking-loader/blocking-loader";
import {WASH_AND_FOLD_SUBCATEGORY} from "../../../../../constants";

const Categories = (props) => {
  const {
    activeTab,
    turnaroundTime,
    updateTurnaroundTime,
    getAllSubcategories,
    subcategories,
    handleTabChange,
  } = props;
  const categoriesTabs = [
    {
      value: "Laundry",
      label: "Laundry",
    },
    {
      value: "Dry_Cleaning",
      label: "Dry Cleaning",
    },
    {
      value: "Products",
      label: "Products",
    },
  ];
  const [turnaroundInHours, setTurnaroundInHours] = useState(`${turnaroundTime} Hrs`);
  const [customTime, setCustomTime] = useState("");
  const [categoryData, setCategoryData] = useState({});
  const [newSubcategoryName, setNewSubcategoryName] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isInFocused, setIsInFocused] = useState({});

  const handleTurnaroundTime = (value) => {
    setTurnaroundInHours(value);
    let turnaroundTime;
    if (value === "12 Hrs") {
      turnaroundTime = 12;
    }
    if (value === "24 Hrs") {
      turnaroundTime = 24;
    }
    if (value === "48 Hrs") {
      turnaroundTime = 48;
    }
    updateTurnaroundTime(subcategories[0].serviceCategoryTypeId, turnaroundTime);
  };

  useEffect(() => {
    const initCustomTime = ![12, 24, 48].includes(turnaroundTime) ? turnaroundTime : "";
    setCustomTime(initCustomTime);
  }, [turnaroundTime]);

  const initialTurnaroundTime = useCallback(() => {
    setTurnaroundInHours(`${turnaroundTime} Hrs`);
  }, [turnaroundTime]);

  const handleCustomTurnaroundTime = (item) => {
    setTurnaroundInHours(item);
    setIsInFocused({
      ...isInFocused,
      [item]: true,
    });
  };

  const handleSubcategoryChange = (prevItem, evt) => {
    setIsInFocused({
      ...isInFocused,
      [prevItem.id]: true,
    });
    setCategoryData({
      ...categoryData,
      [prevItem.id]: evt.target.value,
    });
  };

  const initiateSubcategoryStates = useCallback(() => {
    let subcategoryArr = [];
    let data = {};
    subcategories.forEach((item) => {
      if (activeTab === "Products") {
        data[item.id] = item.name;
      } else if (item.category !== "PER_POUND") {
        data[item.id] = item.category;
      }
      subcategoryArr.push({item});
    });
    setCategoryData(data);
    setCategoryData(data);
  }, [activeTab, subcategories]);

  useEffect(() => {
    initiateSubcategoryStates();
  }, [initiateSubcategoryStates, props.subcategories]);

  const saveTurnaroundTime = () => {
    updateTurnaroundTime(subcategories[0]?.serviceCategoryTypeId, customTime);
    setIsInFocused({
      ...isInFocused,
      Custom: false,
    });
  };
  /*
    this function is for saving the subcategory name change
  */
  const onNewCategorySave = () => {
    let serviceCategoryTypeId;
    if (activeTab === "Dry_Cleaning") {
      serviceCategoryTypeId = 1;
    }
    if (activeTab === "Laundry") {
      serviceCategoryTypeId = 2;
    }
    const data = {
      serviceCategoryTypeId: serviceCategoryTypeId,
      category: newSubcategoryName,
    };
    const productData = {
      name: newSubcategoryName,
    };
    activeTab === "Products"
      ? props.saveNewCategory("Products", productData)
      : props.saveNewCategory(activeTab, data);
    setIsOpen(false);
    setNewSubcategoryName("");
  };

  useEffect(() => {
    getAllSubcategories(activeTab);
    initialTurnaroundTime();
  }, [initialTurnaroundTime, activeTab, turnaroundTime, getAllSubcategories]);

  const renderTurnAroundTimes = () => {
    const times = ["12 Hrs", "24 Hrs", "48 Hrs", "Custom"];
    return (
      <div className={"turnaround-time"}>
        <p className="turnaround-title">Turnaround Time:</p>
        <div className="turnaround-time-container">
          {times.map((item, idx) => {
            return item === "Custom" ? (
              <div className="turnaround-time-item" key={`${item}_${idx}`}>
                <button
                  className={
                    turnaroundInHours === item || ![12, 24, 48].includes(turnaroundTime)
                      ? "btn-theme btn-rounded turnaround-selected-btn"
                      : "btn-theme btn-rounded turnaround-btns"
                  }
                  onClick={() => handleCustomTurnaroundTime(item)}
                >
                  {item}
                </button>
              </div>
            ) : (
              <div className="turnaround-time-item" key={`${item}_${idx}`}>
                <button
                  className={
                    turnaroundInHours === item
                      ? "btn-theme btn-rounded turnaround-selected-btn"
                      : "btn-theme btn-rounded turnaround-btns"
                  }
                  onClick={() => handleTurnaroundTime(item)}
                >
                  {item}
                </button>
              </div>
            );
          })}
        </div>
        {(turnaroundInHours === "Custom" || ![12, 24, 48].includes(turnaroundTime)) && (
          <div className="custom-turnaround-time-container">
            <TextField
              label="Turnaround Time"
              suffix={"hrs"}
              className="team-member-input"
              value={customTime}
              onChange={(e) => {
                setIsInFocused({
                  ...isInFocused,
                  [turnaroundTime]: false,
                });
                setCustomTime(e.target.value);
              }}
              onBlur={() => {
                saveTurnaroundTime();
              }}
              error={props.error !== ""}
            />
            {props.error && <p className="error">{props.error}</p>}
          </div>
        )}
        {props.turnaroundTimeUpdateInProgress ? <BlockingLoader /> : null}
      </div>
    );
  };

  const renderSubcategories = () => {
    let subcategoryArr = [];
    let washandfold = {category: "Wash & Fold"};
    subcategories.forEach((item) => {
      if (item.category !== WASH_AND_FOLD_SUBCATEGORY) {
        subcategoryArr.push(item);
      }
    });
    if (activeTab === "Products") {
      subcategoryArr = sortBy(subcategoryArr, (o) => o?.name?.toLowerCase());
    } else {
      subcategoryArr = sortBy(subcategoryArr, (o) => o?.category?.toLowerCase());
    }
    activeTab === "Laundry" && subcategoryArr.unshift(washandfold);
    return (
      <div className="subcategories-list-container">
        <div className="subcategories-header">
          <p className={"subcategories-title"}>{`Sub-Categories (${
            subcategories.length || 0
          }):`}</p>
        </div>
        <div className="add-new-subcategory" onClick={() => setIsOpen(true)}>
          <img src={plusIcon} className="icon" alt="" />
          <p className="pointer">Add New Sub-Category</p>
        </div>
        {subcategoryArr.map((item, idx) => {
          return item.category === "Wash & Fold" && activeTab === "Laundry" ? (
            <div key={`${item.category}_${idx}`}>
              <p>{`Wash & Fold`}</p>
            </div>
          ) : activeTab === "Products" ? (
            <div key={`${item.category}_${idx}`} className={"item"}>
              <TextField
                name={`${item.name}`}
                label={isInFocused[item.id] ? "Sub-Category Name" : null}
                isInline={true}
                className="team-member-input"
                value={categoryData[item.id] || ""}
                onChange={(e) => {
                  handleSubcategoryChange(item, e);
                }}
                onBlur={() => {
                  props.handleSave(item, categoryData[item.id], activeTab);
                  setIsInFocused({...isInFocused, [item.id]: false});
                }}
              />
            </div>
          ) : (
            <div key={`${item.category}_${idx}`} className={"item"}>
              <TextField
                name={`${item.category}`}
                label={isInFocused[item.id] ? "Sub-Category Name" : null}
                isInline={true}
                className="item material-like-text-field"
                value={categoryData[item.id] || ""}
                onChange={(e) => {
                  handleSubcategoryChange(item, e);
                }}
                onBlur={() => {
                  props.handleSave(item, categoryData[item.id], activeTab);
                  setIsInFocused({...isInFocused, [item.id]: false});
                }}
              />
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card>
      <div>
        {isOpen && (
          <Modal isConfirmationPopup={isOpen}>
            <Card className="popup-card">
              <div className="close" onClick={() => setIsOpen(false)}>
                <img src={exitIcon} className="icon" alt="" />
              </div>
              <div className="card-wrapper">
                <div className="popup-title" onClick={() => setIsOpen(true)}>
                  <p>Add New Sub-Category</p>
                </div>
                <div className="input-container">
                  <img src={categoryIcon} className="icon" alt="" />
                  <TextField
                    label="Sub-Category Name"
                    className="service-name-input"
                    name="newSubcategory"
                    onChange={(evt) => {
                      setNewSubcategoryName(evt.target.value);
                    }}
                    value={newSubcategoryName}
                  />
                </div>
                <div className="new-category-button-container">
                  <button
                    className="btn-theme btn-rounded save-button"
                    onClick={() => onNewCategorySave()}
                  >
                    SAVE
                  </button>
                </div>
              </div>
            </Card>
          </Modal>
        )}
        <div className={"bo-global-settings-content-column"}>
          <div className="categories-holder">
            <div className="categories-header">
              <p>Categories</p>
            </div>
            <div className="categories-content">
              <div className="categories-tabbed-content">
                <TabSwitcher
                  tabs={categoriesTabs}
                  className="location-tabs"
                  activeTab={activeTab}
                  onTabClick={handleTabChange}
                />
                <div>
                  {activeTab !== "Products" && renderTurnAroundTimes()}
                  {renderSubcategories()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default Categories;
