import React, {useEffect, useState, Fragment} from "react";
import * as filestack from "filestack-js";

// Icons
import productNameIcon from "../../../../assets/images/Icon_Role_Side_Panel.svg";
import categoryIcon from "../../../../assets/images/Icon_Product_Category_Side_Panel.svg";
import imageIcon from "../../../../assets/images/Icon_Photo_Side_Panel.svg";
import notesIcon from "../../../../assets/images/Icon_Notes_Cycle_Details.svg";
import barcodeIcon from "../../../../assets/images/Icon_Barcode_Side_Panel.svg";
import imagePlaceholder from "../../../../assets/images/Image_Placeholder.svg";
import dollarIcon from "../../../../assets/images/Icon_Price.svg";
import exitIcon from "../../../../assets/images/Icon_Exit_Side_Panel.svg";
// Commons
import TextField from "../../../commons/textField/textField";
import TextArea from "../../../commons/text-area/text-area";
import MaterialSelect from "../../../commons/select/select";
import BlockingLoader from "../../../commons/blocking-loader/blocking-loader";

let client;
const ProductDetails = (props) => {
  let {
    activeProductDetails,
    productCategories,
    handleFieldChange,
    productDetailsErrors,
    activeProductId,
    fetchProductDetails,
    isProductDetailsLoading,
    productsListCallInProgress,
    productDetailsError,
    productsListError,
    productDetailsNullDescription,
    fileStackKey,
    fetchFileStackKey,
    handleSave,
    isProductDetailsUpdateLoading,
    productDetailsUpdateError,
    preventDetailsRefresh,
    resetPreventDetailsRefresh,
    handlePriceClick,
    showNewCategoryScreenInDetails,
    newCategoryError,
    newCategoryCallInProgress,
    createNewCategory,
    searchText,
    searchInProgress,
  } = props;

  useEffect(
    () => {
      if (preventDetailsRefresh) {
        resetPreventDetailsRefresh();
        return;
      }
      fetchProductDetails(activeProductId);
    },
    [activeProductId, fetchProductDetails] //eslint-disable-line
  );

  useEffect(() => {
    if (!fileStackKey) {
      fetchFileStackKey();
      return;
    }
    client = filestack.init(fileStackKey); // Initialize filestack client on mount;
  }, [fileStackKey, fetchFileStackKey]);

  const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    setNewCategory("");
  }, [showNewCategoryScreenInDetails]);

  const [isPickerOpening, setPickerOpening] = useState(false);

  const getCategoryOptions = () => {
    if (!productCategories) {
      return [];
    }
    return [
      {value: "new-category", label: "+ Add New Category"},
      ...productCategories.map((cat) => {
        return {
          value: cat.id,
          label: cat.name,
        };
      }),
    ];
  };

  const getCategoryOption = (catId) => {
    if (!productCategories || !catId) {
      return null;
    }

    let cat = productCategories.find((cat) => cat.id === catId);

    if (!cat) {
      return null;
    }
    return {
      value: cat.id,
      label: cat.name,
    };
  };

  const handleImageClick = async () => {
    setPickerOpening(true);
    if (!client) {
      if (!fileStackKey) {
        await fetchFileStackKey();

        // Sleep async for half a sec and then hope the key is set
        await new Promise((res, rej) => {
          setTimeout(() => {
            res();
          }, 500);
        });

        if (!fileStackKey) {
          setPickerOpening(false);
          return;
        }
      }
      client = filestack.init(fileStackKey); // Initialising it on mount - to reduce delay after click;
    }
    const options = {
      maxFiles: 1,
      uploadInBackground: false,
      accept: "image/*",
      onUploadDone: (res) => {
        if (res.filesUploaded && res.filesUploaded[0]) {
          let imageUrl = res.filesUploaded[0].url;
          if (activeProductDetails.id) {
            handleFieldChange(activeProductDetails.id, "productImage", imageUrl);
          }
          handleSave(
            {...activeProductDetails, productImage: imageUrl},
            searchText,
            searchInProgress
          );
        }
      },
      onClose: () => {
        setPickerOpening(false);
      },
    };
    client.picker(options).open();
  };

  const getPriceString = () => {
    if (activeProductDetails.price || activeProductDetails.price === 0) {
      if (typeof activeProductDetails.price === "string") {
        return activeProductDetails.price; // already formatted
      } else if (typeof activeProductDetails.price === "number") {
        return `$ ${activeProductDetails.price.toFixed(2)} /unit`;
      } else {
        return "Go to prices"; // rare case where something is wrong with data,
      }
    } else {
      return "Go to prices"; // rare case where something is wrong with data,
    }
  };

  const handleNewCategory = (newCategoryName) => {
    setNewCategory(newCategoryName.trim());
  };

  const handleButtonDisable = () => {
    if (!showNewCategoryScreenInDetails) {
      return false;
    } else {
      return newCategory.trim().length ? false : true;
    }
  };

  const renderNewCategoryScreen = () => {
    return (
      <div className="new-category-main-container">
        <div className="new-category-exit-icon-container">
          <img
            src={exitIcon}
            alt=""
            onClick={() => {
              props.showNewCategoryScreenInDetails(false);
            }}
          />
        </div>
        <p>Add New Category</p>
        <div className="new-category-inputs-container">
          <img src={categoryIcon} alt="" />
          <input
            type="text"
            name="newCategory"
            placeholder="Category Name"
            onChange={(evt) => handleNewCategory(evt.target.value)}
            maxLength="50"
          />
        </div>
      </div>
    );
  };

  return (
    <Fragment>
      {productDetailsError || productsListError ? (
        <p>{productDetailsError || productsListError}</p>
      ) : isProductDetailsLoading || productsListCallInProgress ? (
        <BlockingLoader />
      ) : productDetailsNullDescription ? (
        <div className="product-details-container null-description">
          <p>{productDetailsNullDescription}</p>{" "}
        </div>
      ) : (
        <div className="product-details-container">
          {isProductDetailsUpdateLoading || newCategoryCallInProgress ? (
            <BlockingLoader />
          ) : null}
          {/* <div className="stats-container">

							</div> */}

          {showNewCategoryScreenInDetails ? (
            renderNewCategoryScreen()
          ) : (
            <Fragment>
              <div className="input-container">
                <img src={productNameIcon} className="icon" alt="icon" />
                <TextField
                  isInline={true}
                  label="Product Name"
                  className="team-member-input"
                  disabled={!!activeProductDetails.isDeleted}
                  value={activeProductDetails.productName}
                  onChange={(e) => {
                    handleFieldChange(
                      activeProductDetails.id,
                      "productName",
                      e.target.value
                    );
                  }}
                  error={productDetailsErrors.productName}
                  onBlur={() => {
                    handleSave(activeProductDetails, searchText, searchInProgress);
                  }}
                />
              </div>
              <div className="input-container">
                <img src={categoryIcon} className="icon" alt="icon" />
                <MaterialSelect
                  isInline={true}
                  label="Category"
                  className="team-member-input category-in-details"
                  disabled={!!activeProductDetails.isDeleted}
                  options={getCategoryOptions()}
                  value={getCategoryOption(activeProductDetails.categoryId)}
                  onChange={(selectedOption) => {
                    handleFieldChange(
                      activeProductDetails.id,
                      "categoryId",
                      selectedOption.value
                    );
                    if (selectedOption.value !== "new-category") {
                      handleSave(
                        {
                          ...activeProductDetails,
                          categoryId: selectedOption.value,
                        },
                        searchText,
                        searchInProgress
                      );
                    }
                  }}
                  error={productDetailsErrors.categoryId}
                  smallHeight
                />
              </div>
              <div className="input-container description">
                <img src={notesIcon} className="icon" alt="icon" />
                <TextArea
                  isInline={true}
                  label="Description"
                  className="team-member-input inline task-field"
                  disabled={!!activeProductDetails.isDeleted}
                  value={activeProductDetails.description}
                  onChange={(e) => {
                    handleFieldChange(
                      activeProductDetails.id,
                      "description",
                      e.target.value
                    );
                  }}
                  onBlur={() => {
                    handleSave(activeProductDetails, searchText, searchInProgress);
                  }}
                  error={productDetailsErrors.description}
                />
              </div>
              <div className="input-container price-string-container">
                <img src={dollarIcon} className="icon" alt="icon" />
                {activeProductDetails.isDeleted ? (
                  <p className="price-string-disabled">{getPriceString()}</p>
                ) : (
                  <p onClick={handlePriceClick}>{getPriceString()}</p>
                )}
              </div>
              <div className="input-container">
                <img src={barcodeIcon} className="icon" alt="icon" />
                <TextField
                  isInline={true}
                  label="#SKU"
                  className="team-member-input"
                  disabled={!!activeProductDetails.isDeleted}
                  value={activeProductDetails.sku}
                  onChange={(e) => {
                    handleFieldChange(activeProductDetails.id, "sku", e.target.value);
                  }}
                  onBlur={() => {
                    handleSave(activeProductDetails, searchText, searchInProgress);
                  }}
                  error={productDetailsErrors.sku}
                />
              </div>
              <div className="input-container">
                <img src={imageIcon} className="icon" alt="icon" />
                <div className="image-container">
                  {isPickerOpening && <BlockingLoader />}
                  <img
                    src={activeProductDetails.productImage || imagePlaceholder}
                    className={
                      activeProductDetails.isDeleted
                        ? "product-detail-image-disabled"
                        : "product-detail-image"
                    }
                    alt="icon"
                    onClick={!activeProductDetails.isDeleted && handleImageClick}
                  />
                </div>
              </div>
            </Fragment>
          )}
          <div className="input-container save-button-container">
            <p className="error-message">
              {productDetailsUpdateError || newCategoryError}
            </p>
            {showNewCategoryScreenInDetails && (
              <button
                className="btn-theme btn-rounded save-button"
                onClick={() => {
                  createNewCategory({name: newCategory}, activeProductDetails);
                }}
                disabled={handleButtonDisable()}
              >
                SAVE
              </button>
            )}
          </div>
        </div>
      )}
    </Fragment>
  );
};

export default ProductDetails;
