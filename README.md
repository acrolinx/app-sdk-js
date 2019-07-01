# Acrolinx App SDK

SDK for apps running inside of the Acrolinx Sidebar.

## Installation

```bash
    npm install @acrolinx/app-sdk
```

## Example Code


```typescript
import {ApiCommands, ApiEvents, DEVELOPMENT_APP_SIGNATURE, initApi} from '@acrolinx/app-sdk';

// Initialize the Acrolinx App API
const api = initApi({
  appSignature: DEVELOPMENT_APP_SIGNATURE,
  title: 'App Title',
  button: {
    text: 'Extract Text',
    tooltip: 'Extract text from the document'
  },
  requiredCommands: [ApiCommands.openWindow],
  requiredEvents: [ApiEvents.textExtracted],
});

// Listen to events
api.events.textExtracted.addEventListener(textExtractedEvent => {
  console.log('textExtractedEvent', textExtractedEvent.text, textExtractedEvent.languageId);
});

// Execute commands
api.commands.openWindow('http://www.acrolinx.com');
```

## License

Copyright 2019-present Acrolinx GmbH

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at:

[http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

For more information visit: [https://www.acrolinx.com](https://www.acrolinx.com)
