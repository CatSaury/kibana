/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { NavigationPublicPluginStart } from '@kbn/navigation-plugin/public';
import { GuidedOnboardingPluginStart } from '@kbn/guided-onboarding-plugin/public/types';

export interface GuidedOnboardingExamplePluginSetup {
  getGreeting: () => string;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface GuidedOnboardingExamplePluginStart {}

export interface AppPluginStartDependencies {
  navigation: NavigationPublicPluginStart;
  guidedOnboarding: GuidedOnboardingPluginStart;
}
