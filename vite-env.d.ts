// Manual type definitions to replace missing vite/client
declare const process: any;

declare module '*.svg' {
  import * as React from 'react';
  export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement> & { title?: string }>;
  const src: string;
  export default src;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

interface ImportMetaEnv {
  readonly VITE_API_KEY: string
  readonly API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
