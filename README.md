# Entity Addons Plugin

A Backstage frontend plugin that enables a marketplace-like experience for extending component capabilities through reusable addon templates. Filter and display only relevant addons for your components based on their template origin.

![alt text](image.png)

## Features

- **Template-based Addons**: Create reusable addon templates that enhance existing components
- **Smart Filtering**: Automatically discover addons relevant to a component's template origin
- **Visual Discovery**: Display addons in a grid with template cards showing title, description, and metadata
- **One-Click Integration**: Pre-populate the scaffolder form with the current component reference
- **Git-native**: Addons can directly modify component repositories with automated commits

## Installation

```bash
yarn add @k3tech/backstage-plugin-frontend-addons
```

## How It Works

The plugin uses a two-level template binding system:

1. **Template Origin**: The original template used to create a component (stored in `backstage.io/template-origin` annotation)
2. **Addon Templates**: Scaffolder templates marked with `backstage.io/addon-of` annotation that match the origin template
3. **Addon Discovery**: When viewing a component's Addons tab, the plugin queries the catalog for all templates that are addons of that component's origin template
4. **Pre-filled Scaffolder**: Clicking an addon opens the scaffolder with the current component reference pre-populated as `component_ref` parameter

## Quick Start

### 1. Add the Plugin to Your Backstage Instance

Update `<backstage-home>/packages/app/src/components/catalog/EntityPage.tsx`:

```tsx
import { EntityAddonsContent } from '@k3tech/backstage-plugin-frontend-addons';

const defaultEntityPage = (
  <EntityLayout>
    {/* ... other routes ... */}
    <EntityLayout.Route path="/addons" title="Addons">
      <EntityAddonsContent variant="gridItem" />
    </EntityLayout.Route>
  </EntityLayout>
);
```

### 2. Annotate Your Components with a Template Origin

Update your component's `catalog-info.yaml`:

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: my-component
  annotations:
    backstage.io/template-origin: template:default/my-template-origin
spec:
  type: service
  lifecycle: production
```

### 3. Create Addon Templates

Create scaffolder templates with the `backstage.io/addon-of` annotation to link them to your component template:

```yaml
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: my-addon
  title: My Addon
  description: Extends my-template-origin with additional features
  annotations:
    backstage.io/addon-of: template:default/my-template-origin
spec:
  type: Service
  parameters:
    - title: Component Configuration
      required:
        - component_ref
      properties:
        component_ref:
          title: Target Component
          type: string
          description: The component to extend
          ui:field: EntityPicker
          ui:options:
            defaultNamespace: default
            allowedKinds:
              - Component
            catalogFilter:
              - kind: ['Component']
                'metadata.annotations.backstage.io/template-origin': 'template:default/my-template-origin'
        
        my_addon_property:
          title: My Addon Property
          type: string
          description: A property for this addon

  steps:
    - id: fetch_component
      name: Fetch Component Info
      action: catalog:fetch
      input:
        entityRef: ${{ parameters.component_ref }}

    - id: clone_repo
      name: Clone Component Repository
      action: git:clone:azure  # or git:clone for GitHub
      input:
        defaultBranch: main
        repoUrl: ${{ steps.fetch_component.output.entity.metadata.annotations["backstage.io/repo-url"] }}

    - id: apply_addon
      name: Apply Addon Changes
      action: fetch:template
      input:
        url: ./skeleton
        targetPath: ./
        replace: true
        values:
          component_ref: ${{ parameters.component_ref }}
          addon_property: ${{ parameters.my_addon_property }}

    - id: commit_changes
      name: Commit and Push Changes
      action: git:commit:azure  # or git:commit for GitHub
      input:
        createBranch: false
        defaultBranch: feat/my-addon-upgrade
        commitMessage: "feat: upgrade with my-addon"
        gitAuthorName: 'Backstage'

  output:
    links:
      - title: View Component in Catalog
        icon: catalog
        entityRef: ${{ parameters.component_ref }}
```

## Configuration

### Template Binding Annotations

Two key annotations enable the plugin's functionality:

#### Component Annotation: `backstage.io/template-origin`
Applied to components to specify which template they were created from:

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: my-service
  annotations:
    backstage.io/template-origin: template:default/microservice-template
    backstage.io/repo-url: https://github.com/my-org/my-service
spec:
  type: service
  owner: my-team
```

#### Template Annotation: `backstage.io/addon-of`
Applied to addon templates to indicate which component template they extend:

```yaml
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: add-monitoring
  title: Add Monitoring
  description: Add monitoring and observability to microservices
  annotations:
    backstage.io/addon-of: template:default/microservice-template
spec:
  type: Service
  parameters:
    - title: Select Target Component
      required:
        - component_ref
      properties:
        component_ref:
          title: Component to Enhance
          type: string
          ui:field: EntityPicker
          ui:options:
            defaultNamespace: default
            allowedKinds:
              - Component
            catalogFilter:
              - kind: ['Component']
                'metadata.annotations.backstage.io/template-origin': 'template:default/microservice-template'
        
        monitoring_tool:
          title: Monitoring Tool
          type: string
          enum:
            - prometheus
            - datadog
            - newrelic
          description: Select monitoring solution

  steps:
    - id: fetch_component
      name: Fetch Component Repository Info
      action: catalog:fetch
      input:
        entityRef: ${{ parameters.component_ref }}

    - id: clone
      name: Clone Repository
      action: git:clone:azure
      input:
        defaultBranch: main
        repoUrl: ${{ steps.fetch_component.output.entity.metadata.annotations["backstage.io/repo-url"] }}

    - id: apply_monitoring
      name: Apply Monitoring Configuration
      action: fetch:template
      input:
        url: ./monitoring-templates/${{ parameters.monitoring_tool }}
        targetPath: ./
        values:
          monitoring_tool: ${{ parameters.monitoring_tool }}

    - id: commit
      name: Commit Changes
      action: git:commit:azure
      input:
        createBranch: false
        defaultBranch: feat/add-monitoring
        commitMessage: "feat: add ${{ parameters.monitoring_tool }} monitoring"
        gitAuthorName: 'Backstage Bot'

  output:
    links:
      - title: View Component
        icon: catalog
        entityRef: ${{ parameters.component_ref }}
      - title: Repository
        url: ${{ steps.fetch_component.output.entity.metadata.annotations["backstage.io/repo-url"] }}
```

## API Reference

### EntityAddonsContent

The main component for displaying available addons for an entity.

```typescript
import { EntityAddonsContent } from '@k3tech/backstage-plugin-frontend-addons';
```

**Props:**
- `variant?: string` - Display variant (default: `'gridItem'`)

**Features:**
- Automatically detects the current entity's template origin
- Queries the catalog for all matching addon templates
- Displays results in an interactive grid
- Pre-populates scaffolder with entity reference

### Exported Components

```typescript
export { entityAddonsPlugin } from './plugin';
export { EntityAddonsComponent, EntityAddonsContent } from './components/EntityAddons';
export { TemplateCard, TemplateCardGridItem } from './components/TemplateCard';
```

## Advanced Usage Examples

### Example 1: Multiple Addon Categories

Create different addon templates for different aspects:

```yaml
# Addon for adding CI/CD
annotations:
  backstage.io/addon-of: template:default/backend-service
  backstage.io/addon-category: infrastructure

---
# Addon for adding security scanning
annotations:
  backstage.io/addon-of: template:default/backend-service
  backstage.io/addon-category: security

---
# Addon for documentation setup
annotations:
  backstage.io/addon-of: template:default/backend-service
  backstage.io/addon-category: documentation
```

### Example 2: Conditional Addon Parameters

Configure addons to accept component-specific metadata:

```yaml
steps:
  - id: fetch_component
    name: Load Component Details
    action: catalog:fetch
    input:
      entityRef: ${{ parameters.component_ref }}

  - id: apply_addon
    name: Apply Based on Component Type
    action: fetch:template
    input:
      url: ./templates
      values:
        component_owner: ${{ steps.fetch_component.output.entity.metadata.annotations["backstage.io/owner"] }}
        component_lifecycle: ${{ steps.fetch_component.output.entity.spec.lifecycle }}
```

## Troubleshooting

### Addons Not Showing

1. **Verify the annotation format**: Ensure `backstage.io/template-origin` in your component exactly matches `backstage.io/addon-of` in your addon template
2. **Check catalog sync**: Run `backstage-cli catalog:refresh` to ensure templates are indexed
3. **Validate YAML**: Use a YAML validator to ensure proper formatting

### Pre-population Not Working

1. **Check component reference**: Component must be accessible in the catalog
2. **Verify EntityPicker configuration**: Ensure catalog filters match your component annotations
3. **Test URL encoding**: The component ref is URL-encoded; verify special characters are handled

## Best Practices

- **Naming**: Use consistent, descriptive names for addon templates (e.g., `add-logging`, `add-security-scanning`)
- **Documentation**: Add clear descriptions to addon templates so users understand what they do
- **Testing**: Test addon templates with sample components before promoting to production
- **Git Workflow**: Use feature branches (e.g., `feat/addon-name`) to keep changes organized
- **Metadata**: Include ownership and lifecycle information in component annotations for better governance

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This plugin is licensed under the [Apache-2.0 License](LICENSE).

```
