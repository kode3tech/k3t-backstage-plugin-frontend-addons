
import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import { Content, ContentHeader, ItemCardGrid } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { catalogApiRef, useEntity } from '@backstage/plugin-catalog-react';
import { TemplateCard } from '../TemplateCard';

import React, { useEffect, useState } from 'react';
import { Environment } from 'nunjucks';
export type  K3tMetadataAnnotations  = Entity & {
  metadata: {
    /** @deprecated Use metadata.k3t.io.scaffolder-origin instead */
    template?: string,
    'k3t.io'?: {
      'scaffolder-origin'?: string,
      'addon-compatible-to'?: string[],
      'addon-custom-entity-ref'?: string,
    }
  }
}

export function EntityAddonsComponent(_props: any) {
  const { entity } = useEntity() || { entity: { metadata: {} } };
  const { 
    kind,
    metadata: {
      name,
      namespace,
      ['k3t.io']: k3tAnnotations
    }
  } = entity as K3tMetadataAnnotations;
  
  const catalogApi = useApi(catalogApiRef);
  const [addons, setAddons] = useState<Entity[]>([])

  const scaffolderOrigin = k3tAnnotations?.['scaffolder-origin'] || `${kind.toLowerCase()}:${namespace || 'default'}/${name}`;
  
  let [, templateKind, templateNamespace, templateName] = /([\w\d-]+:)?([\w\d-]+\/)?([\w\d-]+)$/.exec(scaffolderOrigin.toString()) ?? [];

  templateKind = (templateKind ?? 'template:').replace(':', '')
  templateNamespace = (templateNamespace ?? 'default/').replace('/', '')
  templateName = (templateName ?? `${name}`)

  useEffect(() => {
    Promise.all([
      catalogApi.getEntities({
        filter:{
          ["metadata.k3t.addon-compatible-to"]: `${scaffolderOrigin}`
        }
      }),
      catalogApi.getEntities({
        filter:{
          ["metadata.k3t.addon-compatible-to"]: `any`
        }
      })  
    ])
    .then(result => {
      setAddons([...result[0].items, ...result[1].items])
    })
    .catch(void 0);
  }, [catalogApi, scaffolderOrigin, setAddons])
  
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
              onSelected={(t: K3tMetadataAnnotations) => {
                let entity_ref = stringifyEntityRef({
                  kind: kind,
                  namespace: namespace || 'default',
                  name: name || '',
                });
                
                const custom_entity_ref = t.metadata?.['k3t.io']?.['addon-custom-entity-ref'];
                
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
                    `Error processing 'metadata.[k3t.io].addon-custom-entity-ref' for addon:`,
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
                window.open(`/create/templates/${t.metadata.namespace}/${t.metadata.name}?formData={%22entity_ref%22:%22${encodeURIComponent(entity_ref)}%22}`,)
              }}
            />
          ))}
        </ItemCardGrid>
      </Content>
    )
  );
}