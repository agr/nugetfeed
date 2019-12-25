### NuGet feed watcher

A [web page](https://agrrandom.blob.core.windows.net/nugetfeed/index.html) that
shows the latest packages that appear in (or disappear from) the
[NuGet.org](https://www.nuget.org) feed and their progression through the V3 pipeline.

#### Building

Assuming [npm](https://www.npmjs.com) is available and
[TypeScript](https://www.typescriptlang.org/index.html#download-links) is installed as
a global tool, run:

```
npm install
tsc -p tsconfig.json
npx rollup obj/main.js --file dist/bundle.js --format iife
```

#### Running

Just open the `dist/index.html` file in your browser, or drop `dist/index.html`
and `dist/bundle.js` to a hosting of your choice, then navigate to it.