import { IconComponent } from '@backstage/core-plugin-api';
import { TemplateEntityV1beta3 } from '@backstage/plugin-scaffolder-common';
import React from 'react';
/**
 * The Props for the {@link TemplateCard} component
 * @alpha
 */
export interface TemplateCardProps {
    template: TemplateEntityV1beta3;
    additionalLinks?: {
        icon: IconComponent;
        text: string;
        url: string;
    }[];
    onSelected?: (template: TemplateEntityV1beta3) => void;
}
/**
 * The `TemplateCard` component that is rendered in a list for each template
 * @alpha
 */
export declare const TemplateCard: (props: TemplateCardProps) => React.JSX.Element;
