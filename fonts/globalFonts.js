import { createGlobalStyle } from "styled-components";

import akzidenzWoffBold from "./akzidenzgrotesk-boldextended-webfont.woff";
import akzidenzWoffBold2 from "./akzidenzgrotesk-boldextended-webfont.woff2";
import akzidenzWoff from "./akzidenzgrotesk-extended-webfont.woff";
import akzidenzWoff2 from "./akzidenzgrotesk-extended-webfont.woff2";
import akzidenzWoffMedium from "./akzidenzgrotesk-mediumextended-webfont.woff";
import akzidenzWoff2Medium from "./akzidenzgrotesk-mediumextended-webfont.woff2";

export default createGlobalStyle`
    @font-face {
        font-family: 'akzidenzBoldWoff';
        src: local('akzidenzWoff'), local('akzidenzWoff'),
        url(${akzidenzWoffBold}) format('woff2'),
        url(${akzidenzWoffBold2}) format('woff');
        font-weight: 300;
        font-style: normal;
    }
        @font-face {
        font-family: 'akzidenzWoff';
        src: local('akzidenzWoff'), local('akzidenzWoff'),
        url(${akzidenzWoff}) format('woff2'),
        url(${akzidenzWoff2}) format('woff');
        font-weight: 300;
        font-style: normal;
    }
    @font-face {
        font-family: 'akzidenzWoffExtended';
        src: local('akzidenzWoffExtended'), local('akzidenzWoff'),
        url(${akzidenzWoff}) format('woff2'),
        url(${akzidenzWoff2}) format('woff');
        font-weight: 300;
        font-style: normal;
    }
`;
