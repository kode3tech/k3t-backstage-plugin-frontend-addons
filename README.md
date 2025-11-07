# Entity Addons Plugin

🎯 **K3T Backstage Plugin Frontend Addons** - A powerful solution for extending components in Backstage through a smart, template-based addon marketplace.

This Backstage frontend plugin provides a marketplace-like experience for extending component capabilities through reusable addon templates. It intelligently filters and displays only relevant addons for your components based on their template origin.

---

## 🎬 📊 Live Presentation Preview

> **Interactive Presentation Available!** Watch our comprehensive guide covering architecture, setup, best practices, and more.
>
> 🌐 **Bilingual**: Portuguese (BR) & English | 📱 **Responsive** | 🎨 **Neon Theme** | ⌨️ **Keyboard Navigation**

### ▶️ [**OPEN PRESENTATION** 🎥](./docs/presentation/index.html)

<details>
<summary><strong>Presentation Details</strong></summary>

- **17 Interactive Slides** covering the entire plugin
- **Language Switcher** in top-right corner (PT-BR / EN-US)
- **Instant Language Switching** - your preference is saved
- **Navigation**: Arrow keys or spacebar to navigate
- **Content Includes**:
  - Architecture & template binding system
  - Installation & configuration
  - API reference & components
  - Real-world examples
  - Best practices
  - Troubleshooting guide
  - FAQ section

**Quick Tips:**
- Press `F11` for fullscreen mode
- Use arrow keys `←` `→` or spacebar to navigate
- Click language buttons in top-right to switch
- Available in Brazilian Portuguese (default) and English

</details>

---

## ✨ Key Features

- **🔌 Template-based Addons**: Create reusable addon templates that enhance existing components
- **🎯 Smart Filtering**: Automatically discover addons relevant to your component's template origin
- **👁️ Visual Discovery**: Display addons in a grid with template cards showing title, description, and metadata
- **⚡ One-Click Integration**: Pre-populate the scaffolder form with the current component reference
- **🔗 Git-native**: Addons can directly modify component repositories with automated commits
- **🏗️ Flexible Architecture**: Full support for different template types and custom annotations
- **📦 Lightweight**: Optimized plugin with zero side effects and minimal dependencies

## 🎯 Architecture & How It Works

This plugin uses an **intelligent two-level template binding system**:

```
┌─────────────────────────────────────────────────────────────┐
│         BACKSTAGE CATALOG                                    │
│                                                              │
│  ┌──────────────┐              ┌──────────────────────┐    │
│  │  COMPONENT   │ ─────────┬──▶ │  ADDON TEMPLATES     │    │
│  │              │          │    │  (addon-of link)     │    │
│  │ Origin:      │          │    │                      │    │
│  │ microservice-│──────────┘    │ ✓ Add Monitoring     │    │
│  │ template     │               │ ✓ Add Logging        │    │
│  └──────────────┘               │ ✓ Add Security       │    │
│                                 │ ✓ Add CI/CD          │    │
│                                 └──────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**How It Works:**

1. **Template Origin** (Component Annotation): Stores which template was used to create the component
   ```yaml
   k3t.io/scaffolder-origin: template:default/microservice-template
   ```

2. **Addon Templates** (Scaffolder Templates): Templates marked with `k3t/supported-by` that reference the origin
   ```yaml
   k3t/supported-by: template:default/microservice-template
   ```

3. **Addon Discovery** (Smart Query): When viewing the "Addons" tab, the plugin queries the catalog for matching templates
   
4. **Pre-filled Scaffolder** (Automatic Integration): Clicking an addon pre-populates the scaffolder with the component reference as `entity_ref`

## 📦 Installation

```bash
yarn add @k3tech/backstage-plugin-frontend-addons
```

## 🚀 Quick Start

### Step 1: Install the Plugin

Add the plugin to your Backstage instance by updating `packages/app/src/components/catalog/EntityPage.tsx`:

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

### Step 2: Annotate Your Components with Template Origin

Update your `catalog-info.yaml`:

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: my-microservice
  annotations:
    k3t.io/scaffolder-origin: template:default/microservice-template
    backstage.io/repo-url: https://github.com/my-org/my-microservice
spec:
  type: service
  lifecycle: production
  owner: my-team
```

### Step 3: Create Addon Templates

Create scaffolder templates with the `k3t/supported-by` annotation:

```yaml
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: add-monitoring
  title: 📊 Add Monitoring & Observability
  description: Integrate Prometheus, Grafana and intelligent alerts
  annotations:
    k3t/supported-by: template:default/microservice-template
  tags:
    - monitoring
    - observability
    - infrastructure

spec:
  type: Service
  
  parameters:
    - title: 🎯 Target Configuration
      required:
        - entity_ref
      properties:
        entity_ref:
          title: Select Component
          type: string
          description: Which microservice do you want to monitor?
          ui:field: EntityPicker
          ui:options:
            defaultNamespace: default
            allowedKinds:
              - Component
            catalogFilter:
              - kind: ['Component']
                'metadata.annotations.k3t.io/scaffolder-origin': 'template:default/microservice-template'
        
        monitoring_tool:
          title: 🔧 Monitoring Tool
          type: string
          enum:
            - prometheus
            - datadog
            - newrelic
            - elastic
          description: Which solution do you prefer?
        
        enable_alerts:
          title: 🔔 Enable Alerts
          type: boolean
          default: true

  steps:
    - id: fetch_component
      name: 📦 Fetch Component Information
      action: catalog:fetch
      input:
        entityRef: ${{ parameters.entity_ref }}

    - id: clone_repo
      name: 🔄 Clone Repository
      action: git:clone:azure
      input:
        defaultBranch: main
        repoUrl: ${{ steps.fetch_component.output.entity.metadata.annotations["backstage.io/repo-url"] }}

    - id: apply_monitoring
      name: 📊 Apply Monitoring Configuration
      action: fetch:template
      input:
        url: ./templates/${{ parameters.monitoring_tool }}
        targetPath: ./monitoring
        values:
          monitoring_tool: ${{ parameters.monitoring_tool }}
          enable_alerts: ${{ parameters.enable_alerts }}
          component_name: ${{ steps.fetch_component.output.entity.metadata.name }}

    - id: commit
      name: 💾 Commit Changes
      action: git:commit:azure
      input:
        createBranch: false
        defaultBranch: feat/add-${{ parameters.monitoring_tool }}-monitoring
        commitMessage: "feat: add ${{ parameters.monitoring_tool }} monitoring and observability"
        gitAuthorName: 'Backstage Addon Bot'

  output:
    links:
      - title: 📊 View Component in Catalog
        icon: catalog
        entityRef: ${{ parameters.entity_ref }}
      - title: 🔧 Repository
        url: ${{ steps.fetch_component.output.entity.metadata.annotations["backstage.io/repo-url"] }}
```

## Configuration

### Template Binding Annotations

Two key annotations enable the plugin's functionality:

#### Component Annotation: `k3t.io/scaffolder-origin`
Applied to components to specify which template they were created from:

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: my-service
  annotations:
    k3t.io/scaffolder-origin: template:default/microservice-template
    backstage.io/repo-url: https://github.com/my-org/my-service
spec:
  type: service
  owner: my-team
```

#### Template Annotation: `k3t/supported-by`
Applied to addon templates to indicate which component template they extend:

```yaml
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: add-monitoring
  title: Add Monitoring
  description: Add monitoring and observability to microservices
  annotations:
    k3t/supported-by: template:default/microservice-template
spec:
  type: Service
  parameters:
    - title: Select Target Component
      required:
        - entity_ref
      properties:
        entity_ref:
          title: Component to Enhance
          type: string
          ui:field: EntityPicker
          ui:options:
            defaultNamespace: default
            allowedKinds:
              - Component
            catalogFilter:
              - kind: ['Component']
                'metadata.annotations.k3t.io/scaffolder-origin': 'template:default/microservice-template'
        
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
        entityRef: ${{ parameters.entity_ref }}

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
        entityRef: ${{ parameters.entity_ref }}
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
  k3t/supported-by: template:default/backend-service
  backstage.io/addon-category: infrastructure

---
# Addon for adding security scanning
annotations:
  k3t/supported-by: template:default/backend-service
  backstage.io/addon-category: security

---
# Addon for documentation setup
annotations:
  k3t/supported-by: template:default/backend-service
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
      entityRef: ${{ parameters.entity_ref }}

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

1. **Verify the annotation format**: Ensure `k3t.io/scaffolder-origin` in your component exactly matches `k3t/supported-by` in your addon template
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
