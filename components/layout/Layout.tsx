import Header from "./Header";
import Footer from "./Footer";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-bg text-text">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">{children}</main>
      <Footer />
    </div>
  );
}
