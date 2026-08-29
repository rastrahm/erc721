import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NFTCollection — demo",
  description: "Demo UI de colección ERC-721 con royalties ERC-2981",
};

/**
 * Script inline: aplica tema antes del paint para evitar flash.
 * Lee `localStorage` o `prefers-color-scheme`.
 */
const themeBootScript = `
(function(){
  try {
    var k='nft-theme';
    var t=localStorage.getItem(k);
    if(t!=='light'&&t!=='dark'){
      t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';
    }
    document.documentElement.setAttribute('data-theme', t);
  } catch(e) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();
`;

/**
 * Layout raíz (Server Component).
 * @param {{ children: React.ReactNode }} props
 * @returns {JSX.Element}
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body>
        <main className="shell">{children}</main>
      </body>
    </html>
  );
}
