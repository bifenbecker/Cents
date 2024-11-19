import React from "react";
import Layout from "./AddressSuggestion/Layout";

const AddressSuggestion = ({suggestion, getSuggestionItemProps = null, onClick}) => {
  const onClickHandler = () => {
    onClick({
      isNew: true,
      details: {},
      name: suggestion.description,
    });
  };
  const inputProps = getSuggestionItemProps
    ? getSuggestionItemProps(suggestion, {})
    : {onClick: onClickHandler};
  return (
    <Layout
      key={suggestion.index}
      inputProps={inputProps}
      text={suggestion.description}
    />
  );
};

export default AddressSuggestion;
