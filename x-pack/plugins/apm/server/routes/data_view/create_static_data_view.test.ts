/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { createStaticDataView } from './create_static_data_view';
import { Setup } from '../../lib/helpers/setup_request';
import * as HistoricalAgentData from '../historical_data/has_historical_agent_data';
import { APMConfig } from '../..';
import { DataViewsService } from '@kbn/data-views-plugin/common';

function getMockedDataViewService(existingDataViewTitle: string) {
  return {
    get: jest.fn(() => ({
      title: existingDataViewTitle,
    })),
    createAndSave: jest.fn(),
  } as unknown as DataViewsService;
}

const setup = {
  indices: {
    transaction: 'apm-*-transaction-*',
    span: 'apm-*-span-*',
    error: 'apm-*-error-*',
    metric: 'apm-*-metrics-*',
  } as APMConfig['indices'],
} as unknown as Setup;

describe('createStaticDataView', () => {
  it(`should not create data view if 'xpack.apm.autocreateApmIndexPattern=false'`, async () => {
    const dataViewService = getMockedDataViewService('apm-*');
    await createStaticDataView({
      setup,
      config: { autoCreateApmDataView: false } as APMConfig,
      dataViewService,
    });
    expect(dataViewService.createAndSave).not.toHaveBeenCalled();
  });

  it(`should not create data view if no APM data is found`, async () => {
    // does not have APM data
    jest
      .spyOn(HistoricalAgentData, 'hasHistoricalAgentData')
      .mockResolvedValue(false);

    const dataViewService = getMockedDataViewService('apm-*');

    await createStaticDataView({
      setup,
      config: { autoCreateApmDataView: true } as APMConfig,
      dataViewService,
    });
    expect(dataViewService.createAndSave).not.toHaveBeenCalled();
  });

  it(`should create data view`, async () => {
    // does have APM data
    jest
      .spyOn(HistoricalAgentData, 'hasHistoricalAgentData')
      .mockResolvedValue(true);

    const dataViewService = getMockedDataViewService('apm-*');

    await createStaticDataView({
      setup,
      config: { autoCreateApmDataView: true } as APMConfig,
      dataViewService,
    });

    expect(dataViewService.createAndSave).toHaveBeenCalled();
  });

  it(`should overwrite the data view if the new data view title does not match the old data view title`, async () => {
    // does have APM data
    jest
      .spyOn(HistoricalAgentData, 'hasHistoricalAgentData')
      .mockResolvedValue(true);

    const dataViewService = getMockedDataViewService('apm-*');
    const expectedDataViewTitle =
      'apm-*-transaction-*,apm-*-span-*,apm-*-error-*,apm-*-metrics-*';

    await createStaticDataView({
      setup,
      config: { autoCreateApmDataView: true } as APMConfig,
      dataViewService,
    });

    expect(dataViewService.get).toHaveBeenCalled();
    expect(dataViewService.createAndSave).toHaveBeenCalled();
    // @ts-ignore
    expect(dataViewService.createAndSave.mock.calls[0][0].title).toBe(
      expectedDataViewTitle
    );
    // @ts-ignore
    expect(dataViewService.createAndSave.mock.calls[0][1]).toBe(true);
  });

  it(`should not overwrite an data view if the new data view title matches the old data view title`, async () => {
    // does have APM data
    jest
      .spyOn(HistoricalAgentData, 'hasHistoricalAgentData')
      .mockResolvedValue(true);

    const dataViewService = getMockedDataViewService(
      'apm-*-transaction-*,apm-*-span-*,apm-*-error-*,apm-*-metrics-*'
    );

    await createStaticDataView({
      setup,
      config: { autoCreateApmDataView: true } as APMConfig,
      dataViewService,
    });

    expect(dataViewService.get).toHaveBeenCalled();
    expect(dataViewService.createAndSave).not.toHaveBeenCalled();
  });
});
