const React = require('react');
const { AuthProvider } = require('./src/context/AuthContext');
const AppProviders = require('./src/components/AppProviders').default;

exports.wrapRootElement = ({ element }) => {
  return React.createElement(AuthProvider, null,
    React.createElement(AppProviders, null, element)
  );
};
/**
 * Implement Gatsby's SSR (Server Side Rendering) APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-ssr/
 */

/**
 * @type {import('gatsby').GatsbySSR['onRenderBody']}
 */
exports.onRenderBody = ({ setHtmlAttributes }) => {
  setHtmlAttributes({ lang: `en` })
}
