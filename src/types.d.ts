declare module 'react-copy-to-clipboard' {
  import { ReactNode } from 'react';

  interface CopyToClipboardProps {
    text: string;
    onCopy?: (text: string, result: boolean) => void;
    options?: {
      debug?: boolean;
      message?: string;
      format?: string;
    };
    children: ReactNode;
  }

  export const CopyToClipboard: React.FC<CopyToClipboardProps>;
}

declare module 'qrcode.react' {
  import { FC } from 'react';

  interface QRCodeProps {
    value: string;
    size?: number;
    level?: 'L' | 'M' | 'Q' | 'H';
    bgColor?: string;
    fgColor?: string;
    style?: React.CSSProperties;
    includeMargin?: boolean;
    imageSettings?: {
      src: string;
      height: number;
      width: number;
      excavate?: boolean;
      x?: number;
      y?: number;
    };
  }

  const QRCode: FC<QRCodeProps>;
  export default QRCode;
  export { QRCode };
}
