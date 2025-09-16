import React from 'react';
import { AuthProvider } from './src/context/AuthContext';
import AppProviders from './src/components/AppProviders';

export const wrapRootElement = ({ element }) => (
  <AuthProvider>
    <AppProviders>{element}</AppProviders>
  </AuthProvider>
);
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
