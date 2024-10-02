# Entity Addons

With this plugin will able to filter and extend components capabilities with *Addons* concept.

## Getting started

### Config plugin

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

Update an `catalog-info.yaml`: 

```yaml
...
metadata:
  annotations:
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

    # see 
    # https://github.com/kode3tech/k3t-backstage-plugin-scaffolder-backend-module-plus/blob/HEAD/exemples.md#varsplus
    - id: vars
      name: Memo Vars
      action: vars:plus
      input:
        domain_name: ${{ parameters.domain_name }}
        pascal_name: ${{ parameters.domain_name | title | replace(r/[ _,]+/, '') }}
        repoUrl: ${{ steps.infos.output.entity.metadata.annotations["backstage.io/repo-url"] }}
        
    - id: debug:template:fields
      action: debug:log
      name: Debug Template Fields
      input: 
        vars: ${{ steps.vars.output.result }}

    # see
    # https://github.com/kode3tech/k3t-backstage-plugin-scaffolder-backend-module-azure-devops/blob/main/exemples.md#gitcloneazure
    - id: source
      name: 'Fetch Source'
      action: git:clone:azure
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

    # see
    # https://github.com/kode3tech/k3t-backstage-plugin-scaffolder-backend-module-azure-devops/blob/main/exemples.md#gitcommitazure
    - id: commit
      name: 'Commit and Push changes'
      action: git:commit:azure
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
