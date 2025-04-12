import Header from '@/components/Header';
import UrlShortener from '@/components/UrlShortener';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-3xl space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">
              <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                LinkShort
              </span>
            </h1>
            <p className="text-lg text-muted-foreground">
              A modern and feature-rich URL shortening application. Create short, memorable links in seconds.
            </p>
          </div>

          <UrlShortener />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
            <div className="bg-card rounded-lg border p-4 text-center">
              <h3 className="font-semibold text-lg mb-2">Custom Links</h3>
              <p className="text-muted-foreground">Create custom, branded short links that are easy to remember.</p>
            </div>
            <div className="bg-card rounded-lg border p-4 text-center">
              <h3 className="font-semibold text-lg mb-2">Detailed Analytics</h3>
              <p className="text-muted-foreground">Track link performance with comprehensive click analytics.</p>
            </div>
            <div className="bg-card rounded-lg border p-4 text-center">
              <h3 className="font-semibold text-lg mb-2">QR Code Generation</h3>
              <p className="text-muted-foreground">Generate QR codes for your short links for easy sharing.</p>
            </div>
          </div>
        </div>
      </main>
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} LinkShort. All rights reserved.</p>
      </footer>
    </div>
  );
}
