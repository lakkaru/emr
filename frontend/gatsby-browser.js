/**
 * Implement Gatsby's Browser APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-browser/
 */

import React from 'react';
import { AuthProvider } from './src/context/AuthContext';
import AppProviders from './src/components/AppProviders';

export const wrapRootElement = ({ element }) => (
	<AuthProvider>
		<AppProviders>{element}</AppProviders>
	</AuthProvider>
);
