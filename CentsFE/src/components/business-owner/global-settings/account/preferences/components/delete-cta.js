import React from "react";

const DeleteCta = ({onClick}) => {
  return (
    <span className="delete-cta" onClick={onClick}>
      &#x2715;
    </span>
  );
};

export default DeleteCta;
