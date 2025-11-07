
import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import { Content, ContentHeader, ItemCardGrid } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { catalogApiRef, useEntity } from '@backstage/plugin-catalog-react';
import { TemplateCard } from '../TemplateCard';

import React, { useEffect, useState } from 'react';
import { Environment } from 'nunjucks';

export function EntityAddonsComponent(_props: any) {
  const { entity } = useEntity() || { entity: { metadata: {} } };
  const { 
    kind,
    metadata: {
      name,
      namespace,
      template,
      annotations
    }
  } = entity;
  
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
        ["metadata.annotations.k3t.io/supported-by"]: `${templateRef}`
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
                let entity_ref = stringifyEntityRef({
                  kind: kind,
                  namespace: namespace || 'default',
                  name: name || '',
                });
                
                const custom_entity_ref = t.metadata?.annotations?.['k3t.io/addon-custom-ref-template'];
                
                try {
                  if (custom_entity_ref) {  
                    // At the top of your file, initialize nunjucks:
                    const env = new Environment(undefined, { tags: { variableStart: '{{', variableEnd: '}}' } });
                    
                    // Then in your code:
                    entity_ref = env.renderString(custom_entity_ref, {
                      t,
                      e: entity,
                    });
                  }
                } catch (error) {
                  console.error([
                    `Error processing 'k3t.io/addon-custom-ref-template' annotation for addon:`,
                    `\tTemplate: ${stringifyEntityRef(t)}`,
                    `\tEntity Ref expression: ${custom_entity_ref}`,
                    `Error:`,
                    `\t${error instanceof Error ? error.message : String(error)}`,
                    '* Check that your Nunjucks syntax is correct.',
                    '* See https://mozilla.github.io/nunjucks/ for reference. ',
                    '\t* We are using \'{{\' and \'}}\' to tag variables.',
                    '\t* Context root variables are entity models:',
                    '\t\t* \'e\' for current entity',
                    '\t\t* \'t\' for selected addon template',
                    '* See entity yaml format in https://backstage.io/docs/features/software-catalog/descriptor-format#overall-shape-of-an-entity for examples.'
                  ].join('\n'))
                }
                window.open(`/create/templates/${t.metadata.namespace}/${t.metadata.name}?formData={%22entity_ref%22:%22${entity_ref}%22}`,)
              }}
            />
          ))}
        </ItemCardGrid>
      </Content>
    )
  );
}