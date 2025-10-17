# Front End UI

## Usage

Open a terminal and go to the front-end folder, then run the following command to install dependencies.

```bash
$ yarn install
```

## Available Scripts

In the project directory, you can run:

### `yarn dev`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>

### `yarn build`

Builds the app for production to the `dist` folder.

It correctly bundles Solid in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.

### `yarn serve`

Run the built code in `dist` folder.

## Using Web Components / Micro Front-Ends

- Convert your SolidJS pages into Web Components. SolidJS has built-in support for Web Components via solid-element.
- Embed these Web Components inside the Spring MVC app. The Gradle build will build the front end code and copy the built files into Spring MVC folders.
- This allows gradual migration if you plan to replace parts of your MVC app with SolidJS.

## Build

Here is the configuration in `vite.config.ts`. This is for the Response Hub page. The build will generate `solid-response-hub.js`. If we will develop another page, then we can add it under "input".

```JavaScript
build: {
    minify: true,
    target: "esnext",
    rollupOptions: {
        input: {
            "response-hub": "src/pages/response-hub.element.tsx",
            // "other-page": "src/pages/other-page.element.tsx"
        },
        output: {
            entryFileNames: "solid-[name].js",
            format: "es",
        },
    },
},
```

Here is the example of how to use the built files in other JSP or HTML pages.

```HTML
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script type="module" src="./solid-response-hub.js"></script>
    <title>Document</title>
  </head>
  <body>
    <response-hub-page base-url="base-url-in-specific-environment"></response-hub-page>
  </body>
</html>
```
