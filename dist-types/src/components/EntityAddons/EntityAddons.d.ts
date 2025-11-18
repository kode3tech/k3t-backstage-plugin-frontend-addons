import { Entity } from '@backstage/catalog-model';
import React from 'react';
export type K3tMetadataAnnotations = Entity & {
    metadata: {
        /** @deprecated Use metadata.k3t.io.scaffolder-origin instead */
        template?: string;
        'k3t.io'?: {
            'scaffolder-origin'?: string;
            'addon-compatible-to'?: string[];
            'addon-custom-entity-ref'?: string;
        };
    };
};
export declare function EntityAddonsComponent(_props: any): React.JSX.Element;
