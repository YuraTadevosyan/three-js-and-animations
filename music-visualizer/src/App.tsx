import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { AudioProvider } from '@/contexts/AudioProvider';
import { useHashRoute } from '@/hooks/useHashRoute';
import { AboutPage } from '@/pages/AboutPage';
import { HomePage } from '@/pages/HomePage';

export default function App() {
  const route = useHashRoute();
  return (
    <AudioProvider>
      <div className="flex min-h-dvh flex-col">
        <Header route={route} />
        {route === '#/about' ? <AboutPage /> : <HomePage />}
        <Footer />
      </div>
    </AudioProvider>
  );
}
