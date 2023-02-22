import { AppProps } from 'next/app';

import '../styles/global.css';
import "@fontsource/jomhuria"

const MyApp = ({ Component, pageProps }) => (
  <Component {...pageProps} />
);

export default MyApp;
