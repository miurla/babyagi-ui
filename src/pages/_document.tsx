import Document, { Html, Head, Main, NextScript } from 'next/document';
import type { DocumentProps } from 'next/document';
import i18nextConfig from '../../next-i18next.config';

type Props = DocumentProps & {};
class Doc extends Document<Props> {
  render() {
    const currentLocale =
      this.props.__NEXT_DATA__.locale ?? i18nextConfig.i18n.defaultLocale;
    return (
      <Html lang={currentLocale}>
        <Head />
        <body className="dark:bg-gray-800">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default Doc;
