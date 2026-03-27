import Header from "./Header";
import Footer from "./Footer";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full flex flex-col">
      <Header />
      <main className="flex-1 min-h-0 overflow-y-auto container mx-auto px-4 py-6 w-full">
        {children}
      </main>
      <Footer />
    </div>
  );
}
