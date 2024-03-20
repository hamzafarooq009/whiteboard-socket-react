// Layout.js
import React from 'react';
import Header from '../src/component/Header'; // Adjust the path if necessary

const Layout = ({ children }) => {
  return (
    <>
      <Header />
      <main>{children}</main>
    </>
  );
};

export default Layout;
