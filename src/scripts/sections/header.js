/**
 * Header Template Script
 * ------------------------------------------------------------------------------
 * A file that contains scripts highly couple code to the Header template.
 *
 * @namespace header
 */

import $ from "jquery";
import { register } from "@shopify/theme-sections";

const selectors = {
  buttons: "[aria-controls]"
};

/**
 * Product section constructor. Runs on page load as well as Theme Editor
 * `section:load` events.
 * @param {string} container - selector for the section container DOM element
 */

register("header", {
  async onLoad() {
    // Stop parsing if we don't have any buttons
    if (!$(selectors.buttons)) {
      return;
    }
  },

  /**
   * Event callback for Theme Editor `section:unload` event
   */
  onUnload() {
    this.$container.off(this.namespace);
  }
});
