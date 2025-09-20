import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import Layout from "@/components/layout/Layout";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <Layout>{children}</Layout>
        </ThemeProvider>
      </body>
    </html>
  );
}
