/**
 * Header Template Script
 * ------------------------------------------------------------------------------
 * A file that contains scripts highly couple code to the Header template.
 *
 * @namespace header
 */

import { register } from '@shopify/theme-sections';
import PredictiveSearch from '@shopify/theme-predictive-search';
import { formatMoney } from '@shopify/theme-currency';

const selectors = {
  buttons: '[aria-controls]',
  search: "[name='q']",
  searchForm: "[role='search']",
  searchResults: '.results'
};

// const classes = {
//   hide: 'hide'
// };

const keyboardKeys = {
  BACKSPACE: 8,
  ENTER: 13,
  ESC: 27,
  SHIFT: 16,
  SPACE: 32,
  TAB: 9,
  ARROW_UP: 38,
  ARROW_DOWN: 40
};

/**
 * Product section constructor. Runs on page load as well as Theme Editor
 * `section:load` events.
 * @param {string} container - selector for the section container DOM element
 */

register('header', {
  async onLoad() {
    // // Stop parsing if we don't have any buttons
    // const buttons = document.querySelector(selectors.buttons);
    // if (!buttons) {
    //   return;
    // }

    const shopifyFeatures = JSON.parse(
      document.getElementById('shopify-features').innerHTML
    );

    // predictiveSearch (results in a dropdown) on type
    // @see https://help.shopify.com/en/themes/development/search/predictive-search#requesting-predictive-search-results-from-the-ajax-api
    if (shopifyFeatures.predictiveSearch === true) {
      this.searchResults = this.container.querySelector(
        selectors.searchResults
      );
      this.searchInput = this.container.querySelector(selectors.search);
      this.onSearchType = this.onSearchType.bind(this);
      this.searchInput.addEventListener('keyup', this.onSearchType);

      // TODO
      // 1 q close predictiveSearch results when users clicks outside or
      // 2 presses 'Esc'
      // 3 allow users to press up and down to navigate the results
      // 4 tab out closes the results

      // 1
      this.onClickOutside = this.onClickOutside.bind(this);
      document.addEventListener('click', this.onClickOutside);

      // 2
      this.onEscPress = this.onEscPress.bind(this);
      this.container.addEventListener('keydown', this.onEscPress);

      // 3 allow users to press up and down to navigate the results
      this.onArrowPress = this.onArrowPress.bind(this);
      this.container.addEventListener('keydown', this.onArrowPress);

      // 4 tab out closes the results
      this.onTab = this.onTab.bind(this);
      this.container.addEventListener('keydown', this.onTab);
    }
  },

  onClickOutside(event) {
    const searchForm = this.container.querySelector(selectors.searchForm);

    if (searchForm !== event.target && !searchForm.contains(event.target)) {
      this.hideSearchResults();
    }
  },

  onEscPress(event) {
    if (event.keyCode === keyboardKeys.ESC) {
      this.hideSearchResults();
      this.searchInput.focus();
    }
  },

  onTab(event) {
    if (event.keyCode === keyboardKeys.TAB) {
      this.hideSearchResults();
    }
  },

  // Navigate through the results by pressing UP/DOWN arrows
  onArrowPress(event) {
    if (
      event.keyCode === keyboardKeys.ARROW_DOWN ||
      event.keyCode === keyboardKeys.ARROW_UP
    ) {
      event.preventDefault();
      const searchInput = this.searchInput;
      const clickableElements = this.searchResults.querySelectorAll('a');

      // Get index of activeElement
      let activeElementIndex = -1;

      for (let i = 0; i < clickableElements.length; i++) {
        if (document.activeElement === clickableElements[i]) {
          activeElementIndex = i;
        }
      }

      // Normally we go to the next or previous result but sometimes we need
      // to go to the first or last result
      if (event.keyCode === keyboardKeys.ARROW_DOWN) {
        if (
          document.activeElement ===
            clickableElements[clickableElements.length - 1] ||
          document.activeElement === searchInput
        ) {
          clickableElements[0].focus();
        } else if (activeElementIndex > -1) {
          clickableElements[activeElementIndex + 1].focus();
        }
      } else if (event.keyCode === keyboardKeys.ARROW_UP) {
        if (
          document.activeElement === clickableElements[0] ||
          document.activeElement === searchInput
        ) {
          clickableElements[clickableElements.length - 1].focus();
        } else if (activeElementIndex > -1) {
          clickableElements[activeElementIndex - 1].focus();
        }
      }
    }
  },

  // User is typing search terms - poll the predictive search API
  // then display the results
  onSearchType(event) {
    if (
      event.keyCode !== keyboardKeys.SPACE &&
      event.keyCode !== keyboardKeys.BACKSPACE &&
      event.keyCode < 49
    ) {
      return;
    }

    const searchInput = event.target;

    const predictiveSearch = new PredictiveSearch({
      resources: {
        type: [
          PredictiveSearch.TYPES.PRODUCT,
          PredictiveSearch.TYPES.PAGE,
          PredictiveSearch.TYPES.ARTICLE
        ],
        limit: 4,
        options: {
          unavailable_products: PredictiveSearch.UNAVAILABLE_PRODUCTS.LAST,
          fields: [
            PredictiveSearch.FIELDS.TITLE,
            PredictiveSearch.FIELDS.VENDOR,
            PredictiveSearch.FIELDS.PRODUCT_TYPE,
            PredictiveSearch.FIELDS.VARIANTS_TITLE
          ]
        }
      }
    });

    // Set success event listener
    predictiveSearch.on('success', (suggestions) => {
      const productSuggestions = suggestions.resources.results.products;
      const pageSuggestions = suggestions.resources.results.pages;
      const articleSuggestions = suggestions.resources.results.articles;

      // Start building up the results template
      this.searchResults.innerHTML = '';

      if (productSuggestions || pageSuggestions || articleSuggestions) {
        this.searchResults.removeAttribute('hidden');
        this.searchResults.setAttribute('aria-expanded', true);
      }

      // Products
      if (productSuggestions.length > 0) {
        let productsList = '';
        for (var i = 0; i < productSuggestions.length; i++) {
          productsList += `<li role="option"><a href="${productSuggestions[i].url}" tabindex="-1">`;

          // Show the product image, if there is one
          if (
            productSuggestions[i].featured_image &&
            productSuggestions[i].featured_image.url
          ) {
            productsList += `<img src="${productSuggestions[i].featured_image.url}" alt="" />`;
          }

          productsList += `<div><div>${productSuggestions[i].title}</div>`;

          if (productSuggestions[i].price) {
            const price = formatMoney(
              productSuggestions[i].price,
              theme.moneyFormat
            );

            // If variants have different prices we want to write 'From $xxxx' and not just '$xxx'
            if (
              productSuggestions[i].price_min &&
              productSuggestions[i].price_max &&
              productSuggestions[i].price_max !==
                productSuggestions[i].price_min
            ) {
              productsList += theme.strings.fromTextHtml.replace(
                '{{ price }}',
                price
              );
            } else {
              productsList += price;
            }
          }

          // If the product is on sale, then show the old price
          if (
            productSuggestions[i].compare_at_price_max &&
            productSuggestions[i].compare_at_price_max >
              productSuggestions[i].price_max
          ) {
            productsList += ` <del>${formatMoney(
              productSuggestions[i].compare_at_price_max,
              theme.moneyFormat
            )}</del>`;
          }

          productsList += `</div></a></li>`;
        }

        // Show a message/link to let user get more results
        if (
          productSuggestions.length > 0 ||
          pageSuggestions.length > 0 ||
          articleSuggestions.length > 0
        ) {
          this.searchResults.innerHTML += `<div class="results-section"><h2 class="results-title">${theme.strings.productSuggestions}</h2><ul role="listbox">${productsList}</ul></div>`;
        }
      }

      // Pages
      if (pageSuggestions.length > 0) {
        let pagesList = '';
        for (var i = 0; i < pageSuggestions.length; i++) {
          pagesList += `<li role="option"><a href="${pageSuggestions[i].url}">${pageSuggestions[i].title}</a></li>`;
        }
        this.searchResults.innerHTML += `<div class="results-section"><h2 class="results-title">${theme.strings.pageSuggestions}</h2><ul role="listbox">${pagesList}</ul></div>`;
      }

      // Articles (blogs)
      if (articleSuggestions.length > 0) {
        let articlesList = '';
        for (var i = 0; i < articleSuggestions.length; i++) {
          articlesList += `<li role="option"><a href="${articleSuggestions[i].url}">${articleSuggestions[i].title}</a></li>`;
        }
        this.searchResults.innerHTML += `<div class="results-section"><h2 class="results-title">${theme.strings.articleSuggestions}</h2><ul role="listbox">${articlesList}</ul></div>`;
      }

      // Search for `query`
      const searchFor = theme.strings.searchFor.replace(
        '{{ query }}',
        searchInput.value
      );
      this.searchResults.innerHTML += `<div class="results-section"><a href="/search?q=${searchInput.value}" tabindex="-1">${searchFor} -></div>`;
    });

    // Set error event listener
    predictiveSearch.on('error', (error) => {
      this.hideSearchResults();
      console.error('Error message:', error.message);
    });

    // Send query if long enough otherwise don't show any predictions
    if (searchInput.value.length >= 2) {
      predictiveSearch.query(searchInput.value);
    } else {
      this.hideSearchResults();
    }
  },

  // Reset and hide the results
  hideSearchResults() {
    this.searchResults.innerHTML = '';
    this.searchResults.setAttribute('hidden', true);
    this.searchResults.setAttribute('aria-expanded', false);
  },

  /**
   * Event callback for Theme Editor `section:unload` event
   */
  onUnload() {
    // this.$container.off(this.namespace);
    this.container.off(this.namespace);
  }
});
