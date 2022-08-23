/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { AppMountParameters, CoreStart } from '@kbn/core/public';
import { AppPluginStartDependencies } from './types';
import { GuidedOnboardingExampleApp } from './components/app';

export const renderApp = (
  { notifications, http }: CoreStart,
  { navigation, guidedOnboarding }: AppPluginStartDependencies,
  { appBasePath, element }: AppMountParameters
) => {
  ReactDOM.render(
    <GuidedOnboardingExampleApp
      basename={appBasePath}
      notifications={notifications}
      http={http}
      navigation={navigation}
      guidedOnboarding={guidedOnboarding}
    />,
    element
  );

  return () => ReactDOM.unmountComponentAtNode(element);
};
