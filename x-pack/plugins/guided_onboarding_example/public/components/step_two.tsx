/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';

import { EuiText } from '@elastic/eui';

import { CoreStart } from '@kbn/core/public';
import { NavigationPublicPluginStart } from '@kbn/navigation-plugin/public';

import { GuidedOnboardingPluginStart } from '@kbn/guided-onboarding-plugin/public/types';

interface StepTwoProps {
  basename: string;
  notifications: CoreStart['notifications'];
  http: CoreStart['http'];
  navigation: NavigationPublicPluginStart;
  guidedOnboarding: GuidedOnboardingPluginStart;
}

export const StepTwo = (props: StepTwoProps) => {
  return (
    <>
      <EuiText>
        <p>Step 2</p>
      </EuiText>
    </>
  );
};
