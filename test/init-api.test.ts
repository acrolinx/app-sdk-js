/*
 * Copyright 2019-present Acrolinx GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, softwareq
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  ApiCommands,
  ApiEvents,
  DEVELOPMENT_APP_SIGNATURE,
  initApi
} from '../src';

describe('initApi', () => {
  beforeEach(() => {
    window.open = jest.fn();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    window.console.warn = jest.fn();
  });

  it('initApi returns something', () => {
    const api = initApi({
      title: 'app title',
      requiredCommands: [],
      requiredEvents: []
    });
    expect(api).toBeTruthy();
  });

  it('compiles the readme example', () => {
    // Initialize the Acrolinx App API
    const api = initApi({
      appSignature: DEVELOPMENT_APP_SIGNATURE,
      title: 'App Title',
      button: {
        text: 'Extract Text',
        tooltip: 'Extract text from the document'
      },
      requiredCommands: [ApiCommands.openWindow],
      requiredEvents: [ApiEvents.textExtracted]
    });

    // Listen to events
    api.events.textExtracted.addEventListener(textExtractedEvent => {
      console.log(
        'textExtractedEvent',
        textExtractedEvent.text,
        textExtractedEvent.languageId
      );
    });

    // Execute commands
    api.commands.openWindow('https://www.acrolinx.com');
  });
});
