# entity-addons

Welcome to the entity-addons plugin!

_This plugin was created through the Backstage CLI_

## Getting started

### Config plugin

Copy entire project folder to `<backstage-home>/plugins`.

Update `<backstage-home>/packages/app/package.json`:

```json
  "dependencies": {
    "@k3tech/k3t-backstage-plugin-frontend-addons": "link:../../plugins/k3t-backstage-plugin-frontend-addons"
  }
```

Update `<backstage-home>/packages/app/src/components/catalog/EntityPage.tsx`:

```tsx
...
import { EntityAddonsComponent } from '@k3tech/k3t-backstage-plugin-frontend-addons';
...
const serviceEntityPage = (
  <EntityLayout>
    ...
    <EntityLayout.Route path="/addons" title="Addons">
      <EntityAddonsComponent variant="gridItem" />
    </EntityLayout.Route>

  </EntityLayout>
);
```

### Config addons template bindings

Add on component `catalog-info.yaml`: 

```yaml
...
metadata:
  annotations:
    ...
    backstage.io/template-origin: template:default/my-template-origin-name
```

Create new template like this:

```yaml
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: my-template-origin-name-addon
  title: My Addon
  description: My Addon
  annotations:
    backstage.io/addon-of: template:default/my-template-origin-name
spec:
  type: Service
  parameters:
    - title: Component
      required:
        - component_ref
        - domain_name
      properties:
        component_ref:
          title: Component
          type: string
          description: Filter only compatible components
          ui:field: EntityPicker
          ui:options:
            defaultNamespace: z # force to aways bind full entity ref {kind}:{namespace}/{name}
            allowedKinds:
              - Component
            catalogFilter:
              - kind: ['Component']
                'metadata.annotations.backstage.io/template-origin': 'template:default/my-template-origin-name'

        domain_name:
          title: Domain Name
          type: string
          ui:field: ChicInput
          description: |
            <b>{{domain_name | title | replace(r/[ _,]+/, '')}}</b>.cs <br/>
            Implementations/<b>{{domain_name  | title | replace(r/[ _,]+/, '')}}</b>Service.cs <br/>
            I<b>{{domain_name | title | replace(r/[ _,]+/, '')}}</b>Service.cs <br/>

  steps:
    - id: infos
      name: Carregando informações
      action: catalog:fetch
      input:
        entityRef: ${{ parameters.component_ref }}

    - id: vars
      name: Memo Vars
      action: var
      input:
        domain_name: ${{ parameters.domain_name }}
        pascal_name: ${{ parameters.domain_name | title | replace(r/[ _,]+/, '') }}
        repoUrl: ${{ steps.infos.output.entity.metadata.annotations["backstage.io/repo-url"] }}
        
    - id: debug:template:fields
      action: debug:log
      name: Debug Template Fields
      input: 
        vars: ${{ steps.vars.output.result }}

    - id: source
      name: 'Fetch Source'
      action: git:checkout:azure
      input:
        defaultBranch: main
        repoUrl: ${{ steps.vars.output.result.repoUrl }}

    - id: fetch-template
      name: Fetch Template
      action: fetch:template
      input:
        url: ./skeleton
        targetPath: ./
        replace: true
        values: ${{ steps.vars.output.result }}

    - id: debug:fs:read
      name: Debug Content files 
      action: debug:fs:read
      input:
        files: 
        - src/ApplicationCore/Domain/Entities/${{ steps.vars.output.result.pascal_name }}.cs
        - src/ApplicationCore/Domain/Services/Implementations/${{ steps.vars.output.result.pascal_name }}Service.cs
        - src/ApplicationCore/Domain/Services/I${{ steps.vars.output.result.pascal_name }}Service.cs

    - id: push
      name: 'Push changes'
      action: git:push:azure
      input:
        createBranch: false
        defaultBranch: "feat/domain-${{ steps['vars'].output.result.pascal_name }}"
        commitMessage: "feat: add domain ${{ steps['vars'].output.result.pascal_name }}"
        gitAuthorName: 'Backstage'


  output:
    links:
      - title: Repository
        url: ${{ steps.vars.output.result.repoUrl }}

      - title: Open in catalog
        icon: catalog
        entityRef: ${{ parameters.component_ref }}

```
