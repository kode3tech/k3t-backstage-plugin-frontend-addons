import React from 'react';
import { TemplateEntityV1beta3 } from '@backstage/plugin-scaffolder-common';
/**
 * Props for the CardHeader component
 */
export interface CardHeaderProps {
    template: TemplateEntityV1beta3;
}
/**
 * The Card Header with the background for the TemplateCard.
 */
export declare const CardHeader: (props: CardHeaderProps) => React.JSX.Element;
