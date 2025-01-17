/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getSampleDashboardInput } from '../test_helpers';
import { DashboardContainer } from '../embeddable/dashboard_container';

import { coreMock, uiSettingsServiceMock } from '@kbn/core/public/mocks';
import { CoreStart } from '@kbn/core/public';
import { FiltersNotificationBadge } from '.';
import { embeddablePluginMock } from '@kbn/embeddable-plugin/public/mocks';
import { type Query, type AggregateQuery, Filter } from '@kbn/es-query';

import {
  ErrorEmbeddable,
  FilterableEmbeddable,
  IContainer,
  isErrorEmbeddable,
} from '../../services/embeddable';
import {
  ContactCardEmbeddable,
  ContactCardEmbeddableFactory,
  ContactCardEmbeddableInput,
  ContactCardEmbeddableOutput,
  CONTACT_CARD_EMBEDDABLE,
} from '../../services/embeddable_test_samples';
import { getStubPluginServices } from '@kbn/presentation-util-plugin/public';
import { screenshotModePluginMock } from '@kbn/screenshot-mode-plugin/public/mocks';

const { setup, doStart } = embeddablePluginMock.createInstance();
setup.registerEmbeddableFactory(
  CONTACT_CARD_EMBEDDABLE,
  new ContactCardEmbeddableFactory((() => null) as any, {} as any)
);
const start = doStart();

let action: FiltersNotificationBadge;
let container: DashboardContainer;
let embeddable: ContactCardEmbeddable & FilterableEmbeddable;
const mockGetFilters = jest.fn(async () => [] as Filter[]);
const mockGetQuery = jest.fn(async () => undefined as Query | AggregateQuery | undefined);
let coreStart: CoreStart;

const getMockPhraseFilter = (key: string, value: string) => {
  return {
    meta: {
      type: 'phrase',
      key,
      params: {
        query: value,
      },
    },
    query: {
      match_phrase: {
        [key]: value,
      },
    },
    $state: {
      store: 'appState',
    },
  };
};

beforeEach(async () => {
  coreStart = coreMock.createStart();

  const containerOptions = {
    ExitFullScreenButton: () => null,
    SavedObjectFinder: () => null,
    application: {} as any,
    embeddable: start,
    inspector: {} as any,
    notifications: {} as any,
    overlays: coreStart.overlays,
    savedObjectMetaData: {} as any,
    uiActions: {} as any,
    uiSettings: uiSettingsServiceMock.createStartContract(),
    http: coreStart.http,
    theme: coreStart.theme,
    presentationUtil: getStubPluginServices(),
    screenshotMode: screenshotModePluginMock.createSetupContract(),
  };

  container = new DashboardContainer(getSampleDashboardInput(), containerOptions);

  const contactCardEmbeddable = await container.addNewEmbeddable<
    ContactCardEmbeddableInput,
    ContactCardEmbeddableOutput,
    ContactCardEmbeddable
  >(CONTACT_CARD_EMBEDDABLE, {
    firstName: 'Kibanana',
  });
  if (isErrorEmbeddable(contactCardEmbeddable)) {
    throw new Error('Failed to create embeddable');
  }

  action = new FiltersNotificationBadge(
    coreStart.application,
    embeddablePluginMock.createStartContract(),
    coreStart.overlays,
    coreStart.theme,
    coreStart.uiSettings
  );
  embeddable = embeddablePluginMock.mockFilterableEmbeddable(contactCardEmbeddable, {
    getFilters: () => mockGetFilters(),
    getQuery: () => mockGetQuery(),
  });
});

test('Badge is incompatible with Error Embeddables', async () => {
  const errorEmbeddable = new ErrorEmbeddable(
    'Wow what an awful error',
    { id: ' 404' },
    embeddable.getRoot() as IContainer
  );
  expect(await action.isCompatible({ embeddable: errorEmbeddable })).toBe(false);
});

test('Badge is not shown when panel has no app-level filters or queries', async () => {
  expect(await action.isCompatible({ embeddable })).toBe(false);
});

test('Badge is shown when panel has at least one app-level filter', async () => {
  mockGetFilters.mockResolvedValue([getMockPhraseFilter('fieldName', 'someValue')] as Filter[]);
  expect(await action.isCompatible({ embeddable })).toBe(true);
});

test('Badge is shown when panel has at least one app-level query', async () => {
  mockGetQuery.mockResolvedValue({ sql: 'SELECT * FROM test_dataview' } as AggregateQuery);
  expect(await action.isCompatible({ embeddable })).toBe(true);
});
