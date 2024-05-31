
## Publishing

```sh

yarn login

yarn release:full && yarn && tsc && yarn build &&  yarn pack && yarn publish --non-interactive

```

## Getting started

Your plugin has been added to the example app in this repository, meaning you'll be able to access it by running `yarn start` in the root directory, and then navigating to [/entity-addons](http://localhost:3000/entity-addons).

You can also serve the plugin in isolation by running `yarn start` in the plugin directory.
This method of serving the plugin provides quicker iteration speed and a faster startup and hot reloads.
It is only meant for local development, and the setup for it can be found inside the [/dev](./dev) directory.


