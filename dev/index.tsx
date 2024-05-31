import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { entityAddonsPlugin, EntityAddonsPage } from '../src/plugin';

createDevApp()
  .registerPlugin(entityAddonsPlugin)
  .addPage({
    element: <EntityAddonsPage />,
    title: 'Root Page',
    path: '/entity-addons'
  })
  .render();
