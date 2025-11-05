
import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import { Content, ContentHeader, ItemCardGrid } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { catalogApiRef, useEntity } from '@backstage/plugin-catalog-react';
import { TemplateCard } from '../TemplateCard';

import React, { useEffect, useState } from 'react';

export function EntityAddonsComponent(_props: any) {
  const { 
    entity: { 
      kind,
      metadata: {
        name,
        namespace,
        template,
        annotations
      }
    }
  } = useEntity() || { entity: { metadata: {} } };

  const catalogApi = useApi(catalogApiRef);
  const [addons, setAddons] = useState<Entity[]>([])

  const templateRef = annotations?.['k3t.io/scaffolder-origin'] ?? template ?? name ?? `template:default/${name}`;

  let [, templateKind, templateNamespace, templateName] = /([\w\d-]+:)?([\w\d-]+\/)?([\w\d-]+)$/.exec(templateRef.toString()) ?? [];

  templateKind = (templateKind ?? 'template:').replace(':', '')
  templateNamespace = (templateNamespace ?? 'default/').replace('/', '')
  templateName = (templateName ?? `${name}`)

  useEffect(() => {
    catalogApi.getEntities({
      filter:{
        ["metadata.annotations.k3t/supported-by"]: `${templateRef}`
      }
    })
    .then(result => {
      setAddons(result.items)
    })
    .catch(void 0);
  }, [catalogApi, templateRef, setAddons])
  
  return (
    (
      <Content>
        <ContentHeader title="Available Addons"/>
        <ItemCardGrid>
          {addons.map((addon) => (
            <TemplateCard
              key={stringifyEntityRef(addon)}
              // additionalLinks={additionalLinks}
              template={addon as any}
              onSelected={(t) => {
                window.open(`/create/templates/${t.metadata.namespace}/${t.metadata.name}?formData={%22component_ref%22:%22${kind.toLowerCase()}:${namespace}/${name}%22}`,)
              }}
            />
          ))}
        </ItemCardGrid>
      </Content>
    )
  );
}