import "lazysizes/plugins/object-fit/ls.object-fit";
import "lazysizes/plugins/parent-fit/ls.parent-fit";
import "lazysizes/plugins/rias/ls.rias";
import "lazysizes/plugins/bgset/ls.bgset";
import "lazysizes";
import "lazysizes/plugins/respimg/ls.respimg";

import "../../styles/theme.scss";
// import '../../styles/theme.scss.liquid';

import { cookiesEnabled } from "@shopify/theme-cart";
// import { wrapTable, wrapIframe } from '@shopify/theme-rte';

import { load } from "@shopify/theme-sections";
import "../sections/header";

// Apply a specific class to the html element for browser support of cookies.
if (cookiesEnabled()) {
  document.documentElement.className = document.documentElement.className.replace(
    "supports-no-cookies",
    "supports-cookies"
  );
}

load(["header"]);
