import React from 'react';

const PageNotFound = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: `100vh`
      }}
    >
      <div style={{ fontSize: 22 }}>Page not found</div>
      <div style={{ fontSize: 26, fontWeight: 'bold' }}>404</div>
    </div>
  );
};
export default PageNotFound;
