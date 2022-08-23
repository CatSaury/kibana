/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useState } from 'react';
import { i18n } from '@kbn/i18n';
import { FormattedMessage, I18nProvider } from '@kbn/i18n-react';
import { BrowserRouter as Router } from 'react-router-dom';

import {
  EuiButton,
  EuiSpacer,
  EuiPage,
  EuiPageBody,
  EuiPageContent,
  EuiPageContentBody,
  EuiPageContentHeader,
  EuiPageHeader,
  EuiTitle,
  EuiText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiFieldNumber,
  EuiSelect,
} from '@elastic/eui';

import { CoreStart } from '@kbn/core/public';
import { NavigationPublicPluginStart } from '@kbn/navigation-plugin/public';

import {
  GuidedOnboardingPluginStart,
  GuidedOnboardingState,
  UseCase,
} from '@kbn/guided-onboarding-plugin/public/types';
import { PLUGIN_ID, PLUGIN_NAME } from '../../common';

interface GuidedOnboardingExampleAppDeps {
  basename: string;
  notifications: CoreStart['notifications'];
  http: CoreStart['http'];
  navigation: NavigationPublicPluginStart;
  guidedOnboarding: GuidedOnboardingPluginStart;
}

export const GuidedOnboardingExampleApp = ({
  basename,
  notifications,
  http,
  navigation,
  guidedOnboarding,
}: GuidedOnboardingExampleAppDeps) => {
  const { guidedOnboardingApi } = guidedOnboarding;

  // Use React hooks to manage state.
  const [selectedGuide, setSelectedGuide] = useState<UseCase | undefined>(undefined);
  const [selectedStep, setSelectedStep] = useState<string | undefined>(undefined);

  const getDataRequest = () => {
    // Use the core http service to make a response to the server API.
    http.get<{ state: GuidedOnboardingState }>('/api/guided_onboarding/state').then((res) => {
      // Use the core notifications service to display a success message.
      notifications.toasts.addSuccess(
        i18n.translate('guidedOnboarding.dataUpdated', {
          defaultMessage: 'Data loaded',
        })
      );
      setSelectedGuide(res.state.active_guide);
      setSelectedStep(res.state.active_step);
    });
  };

  const sendUpdateRequest = async () => {
    const response = await guidedOnboardingApi.updateGuideState$({
      active_guide: selectedGuide,
      active_step: selectedStep,
    });

    if (response) {
      notifications.toasts.addSuccess(
        i18n.translate('guidedOnboardingExample.dataUpdated', {
          defaultMessage: 'Data updated',
        })
      );
    }
  };

  // Render the application DOM.
  // Note that `navigation.ui.TopNavMenu` is a stateful component exported on the `navigation` plugin's start contract.
  return (
    <Router basename={basename}>
      <I18nProvider>
        <>
          <navigation.ui.TopNavMenu
            appName={PLUGIN_ID}
            showSearchBar={true}
            useDefaultBehaviors={true}
          />
          <EuiPage restrictWidth="1000px">
            <EuiPageBody>
              <EuiPageHeader>
                <EuiTitle size="l">
                  <h1>
                    <FormattedMessage
                      id="guidedOnboardingExample.pluginName"
                      defaultMessage="{name}"
                      values={{ name: PLUGIN_NAME }}
                    />
                  </h1>
                </EuiTitle>
              </EuiPageHeader>
              <EuiPageContent>
                <EuiPageContentHeader>
                  <EuiTitle>
                    <h2>
                      <FormattedMessage
                        id="guidedOnboardingExample.title"
                        defaultMessage="Saved objects POC"
                      />
                    </h2>
                  </EuiTitle>
                </EuiPageContentHeader>
                <EuiPageContentBody>
                  <EuiText>
                    <p>
                      <FormattedMessage
                        id="guidedOnboardingExample.timestampText"
                        defaultMessage="State: {state}"
                        values={{
                          state: `guide: ${selectedGuide}, step: ${selectedStep}` ?? 'Unknown',
                        }}
                      />
                    </p>
                  </EuiText>
                  <EuiSpacer />
                  <EuiButton type="primary" size="s" onClick={getDataRequest}>
                    <FormattedMessage
                      id="guidedOnboardingExample.buttonText"
                      defaultMessage="Get data"
                    />
                  </EuiButton>
                  <EuiSpacer />
                  <EuiFlexGroup style={{ maxWidth: 600 }}>
                    <EuiFlexItem>
                      <EuiFormRow label="Guide" helpText="Select a guide">
                        <EuiSelect
                          id={'guideSelect'}
                          options={[
                            { value: 'observability', text: 'observability' },
                            { value: 'security', text: 'security' },
                            { value: 'search', text: 'search' },
                            { value: '', text: 'unset' },
                          ]}
                          value={selectedGuide}
                          onChange={(e) => {
                            const value = e.target.value as UseCase;
                            const shouldResetState = value.trim().length === 0;
                            if (shouldResetState) {
                              setSelectedGuide(undefined);
                              setSelectedStep(undefined);
                            } else {
                              setSelectedGuide(value);
                            }
                          }}
                        />
                      </EuiFormRow>
                    </EuiFlexItem>
                    <EuiFlexItem>
                      <EuiFormRow label="Step">
                        <EuiFieldNumber
                          value={selectedStep}
                          onChange={(e) => setSelectedStep(e.target.value)}
                        />
                      </EuiFormRow>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiFormRow hasEmptyLabelSpace>
                        <EuiButton onClick={sendUpdateRequest}>Save</EuiButton>
                      </EuiFormRow>
                    </EuiFlexItem>
                  </EuiFlexGroup>
                </EuiPageContentBody>
              </EuiPageContent>
            </EuiPageBody>
          </EuiPage>
        </>
      </I18nProvider>
    </Router>
  );
};
