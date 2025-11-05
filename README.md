# Entity Addons Plugin

🎯 **K3T Backstage Plugin Frontend Addons** - Uma solução poderosa para estender componentes no Backstage através de um marketplace de addons inteligente e baseado em templates.

Este plugin frontend do Backstage permite uma experiência tipo marketplace para estender as capacidades de componentes através de templates de addons reutilizáveis. Filtra e exibe apenas addons relevantes para seus componentes com base na origem do template.

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

## ✨ Características Principais

- **🔌 Template-based Addons**: Crie templates de addons reutilizáveis que aprimoram componentes existentes
- **🎯 Smart Filtering**: Descubra automaticamente addons relevantes para a origem do template do seu componente
- **👁️ Visual Discovery**: Exiba addons em grid com cartões de template mostrando título, descrição e metadados
- **⚡ One-Click Integration**: Pré-popule o formulário do scaffolder com a referência do componente atual
- **🔗 Git-native**: Os addons podem modificar diretamente repositórios de componentes com commits automatizados
- **🏗️ Arquitetura Flexível**: Suporte completo para diferentes tipos de templates e anotações customizadas
- **📦 Lightweight**: Plugin otimizado com zero efeitos colaterais e dependencies mínimas

## 🎯 Arquitetura & Funcionamento

Este plugin utiliza um **sistema inteligente de ligação entre templates** em dois níveis:

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

**Fluxo de Funcionamento:**

1. **Template Origin** (Anotação no Componente): Armazena qual template foi usado para criar o componente
   ```yaml
   k3t.io/scaffolder-origin: template:default/microservice-template
   ```

2. **Addon Templates** (Templates Scaffolder): Templates marcados com `k3t/supported-by` que referenciam a origin
   ```yaml
   k3t/supported-by: template:default/microservice-template
   ```

3. **Addon Discovery** (Consulta Inteligente): Quando você visualiza a aba "Addons", o plugin consulta o catálogo para templates com `addon-of` matching
   
4. **Pre-filled Scaffolder** (Integração Automática): Ao clicar em um addon, o scaffolder é pré-populado com a referência do componente como `component_ref`

## 📦 Installation

```bash
yarn add @k3tech/backstage-plugin-frontend-addons
```

## 🚀 Quick Start

### Passo 1: Instalar o Plugin

Adicione o plugin a sua instância Backstage atualizando `packages/app/src/components/catalog/EntityPage.tsx`:

```tsx
import { EntityAddonsContent } from '@k3tech/backstage-plugin-frontend-addons';

const defaultEntityPage = (
  <EntityLayout>
    {/* ... outras rotas ... */}
    <EntityLayout.Route path="/addons" title="Addons">
      <EntityAddonsContent variant="gridItem" />
    </EntityLayout.Route>
  </EntityLayout>
);
```

### Passo 2: Anotar Seus Componentes com Template Origin

Atualize seu `catalog-info.yaml`:

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

### Passo 3: Criar Templates de Addons

Crie templates scaffolder com anotação `k3t/supported-by`:

```yaml
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: add-monitoring
  title: 📊 Add Monitoring & Observability
  description: Integre Prometheus, Grafana e alertas inteligentes
  annotations:
    k3t/supported-by: template:default/microservice-template
  tags:
    - monitoring
    - observability
    - infrastructure

spec:
  type: Service
  
  parameters:
    - title: 🎯 Configuração de Destino
      required:
        - component_ref
      properties:
        component_ref:
          title: Selecionar Componente
          type: string
          description: Qual microserviço você deseja monitorar?
          ui:field: EntityPicker
          ui:options:
            defaultNamespace: default
            allowedKinds:
              - Component
            catalogFilter:
              - kind: ['Component']
                'metadata.annotations.k3t.io/scaffolder-origin': 'template:default/microservice-template'
        
        monitoring_tool:
          title: 🔧 Ferramenta de Monitoramento
          type: string
          enum:
            - prometheus
            - datadog
            - newrelic
            - elastic
          description: Qual solução você prefere?
        
        enable_alerts:
          title: 🔔 Habilitar Alertas
          type: boolean
          default: true

  steps:
    - id: fetch_component
      name: 📦 Buscar Informações do Componente
      action: catalog:fetch
      input:
        entityRef: ${{ parameters.component_ref }}

    - id: clone_repo
      name: 🔄 Clonar Repositório
      action: git:clone:azure
      input:
        defaultBranch: main
        repoUrl: ${{ steps.fetch_component.output.entity.metadata.annotations["backstage.io/repo-url"] }}

    - id: apply_monitoring
      name: 📊 Aplicar Configuração de Monitoramento
      action: fetch:template
      input:
        url: ./templates/${{ parameters.monitoring_tool }}
        targetPath: ./monitoring
        values:
          monitoring_tool: ${{ parameters.monitoring_tool }}
          enable_alerts: ${{ parameters.enable_alerts }}
          component_name: ${{ steps.fetch_component.output.entity.metadata.name }}

    - id: commit
      name: 💾 Fazer Commit das Mudanças
      action: git:commit:azure
      input:
        createBranch: false
        defaultBranch: feat/add-${{ parameters.monitoring_tool }}-monitoring
        commitMessage: "feat: add ${{ parameters.monitoring_tool }} monitoring and observability"
        gitAuthorName: 'Backstage Addon Bot'

  output:
    links:
      - title: 📊 Ver Componente no Catálogo
        icon: catalog
        entityRef: ${{ parameters.component_ref }}
      - title: 🔧 Repositório
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

```
