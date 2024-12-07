import "../styles/globals.css"; // Пътят до вашите глобални стилове, ако използвате Tailwind или друга CSS настройка
import type { AppProps } from "next/app";
import Layout from "../components/Layout"; // Импортиране на Layout компонента

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}
