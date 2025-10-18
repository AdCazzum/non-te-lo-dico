import { Roboto } from "next/font/google";
import "@rainbow-me/rainbowkit/styles.css";
import { DappWrapperWithProviders } from "~~/components/DappWrapperWithProviders";
import { ThemeProvider } from "~~/components/ThemeProvider";
import "~~/styles/globals.css";
import { getMetadata } from "~~/utils/helper/getMetadata";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata = getMetadata({
  title: "non-te-lo-dico | FHE-Protected IPFS Storage",
  description: "Upload and share encrypted files on IPFS with FHE-protected decryption keys powered by ZAMA",
});

const DappWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <html suppressHydrationWarning lang="en">
      <head>
        {/* Font Awesome */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        {/* Favicon */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </head>
      <body className={roboto.className}>
        <ThemeProvider enableSystem>
          <DappWrapperWithProviders>{children}</DappWrapperWithProviders>
          {/* Footer */}
          <div className="w-full pb-1 pt-2 text-right pr-4">
            <span className="text-xs text-gray-500 dark:text-gray-400 inline-flex items-center gap-1">
              Built with <i className="fa-solid fa-heart text-yellow-500"></i> using ZAMA FHE and IPFS
            </span>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default DappWrapper;
