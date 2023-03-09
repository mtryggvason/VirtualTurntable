import React from 'react';
import "../src/fonts.css";
import "../src/App.css";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";


// This default export is required in a new `pages/_app.js` file.
export default function MyApp({ Component, pageProps }) {


  return (
        <Component {...pageProps} />
  );
}
