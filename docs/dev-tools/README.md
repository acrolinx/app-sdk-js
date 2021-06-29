# Experimental Acrolinx App Dev Tools

## Run locally

From root of acrolinx-add-sdk execute:

```
npx serve -l 8031 docs/dev-tools/
```

Open http://localhost:8031/codemirror in your webbrowser.

## Use the deployed version

https://acrolinx.github.io/app-sdk-js/dev-tools/codemirror

## Known limitation

The App Dev Tools support currently only a very limited set of the Acrolinx App API:

  * RequiredCommands.getAppAccessToken
  * RequiredEvents.textExtracted
