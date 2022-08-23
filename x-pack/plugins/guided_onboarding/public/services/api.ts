/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { HttpSetup } from '@kbn/core/public';
import { BehaviorSubject } from 'rxjs';

import { API_BASE_PATH } from '../../common';
import { GuidedOnboardingState } from '../types';

export class ApiService {
  private client: HttpSetup | undefined;
  public onboardingGuideState$!: BehaviorSubject<GuidedOnboardingState | undefined>;

  public setup(httpClient: HttpSetup): void {
    this.client = httpClient;
    this.onboardingGuideState$ = new BehaviorSubject<GuidedOnboardingState | undefined>(undefined);
  }

  public async fetchGuideState() {
    if (!this.client) {
      throw new Error('ApiService has not be initialized.');
    }

    try {
      const { state: guideState } = await this.client.get<{ state: GuidedOnboardingState }>(
        `${API_BASE_PATH}/state`
      );
      this.onboardingGuideState$.next(guideState);
    } catch (e) {
      // TODO handle error
    }
  }

  public async updateGuideState$(newState: GuidedOnboardingState) {
    if (!this.client) {
      throw new Error('ApiService has not be initialized.');
    }

    try {
      const response = await this.client.put<{ state: GuidedOnboardingState }>(
        `${API_BASE_PATH}/state`,
        {
          body: JSON.stringify(newState),
        }
      );
      this.onboardingGuideState$.next(newState);
      return response;
    } catch (error) {
      // TODO handle error
    }
  }
}

export const apiService = new ApiService();
