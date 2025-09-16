/**
 * Implement Gatsby's Browser APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-browser/
 */

const React = require('react');
const { AuthProvider } = require('./src/context/AuthContext');
const AppProviders = require('./src/components/AppProviders').default;

exports.wrapRootElement = ({ element }) => {
	return React.createElement(AuthProvider, null,
		React.createElement(AppProviders, null, element)
	);
};
