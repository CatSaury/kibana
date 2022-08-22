/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';
import { Observable } from 'rxjs';
import useObservable from 'react-use/lib/useObservable';
import { ChromeNavControl } from '../../..';
import { HeaderExtension } from './header_extension';

interface Props {
  navControl$: Observable<ChromeNavControl | undefined>;
}

export function CustomNavControl({ navControl$ }: Props) {
  const navControl = useObservable(navControl$, undefined);

  if (!navControl) {
    return null;
  }

  return <HeaderExtension extension={navControl.mount} />;
}
