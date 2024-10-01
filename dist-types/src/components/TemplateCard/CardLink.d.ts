import { IconComponent } from '@backstage/core-plugin-api';
import React from 'react';
interface CardLinkProps {
    icon: IconComponent;
    text: string;
    url: string;
}
export declare const CardLink: ({ icon: Icon, text, url }: CardLinkProps) => React.JSX.Element;
export {};
