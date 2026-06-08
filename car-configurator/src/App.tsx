import { ConfigProvider } from '@/state/configStore';
import { CarConfigurator } from '@/components/CarConfigurator';

export default function App() {
  return (
    <ConfigProvider>
      <CarConfigurator />
    </ConfigProvider>
  );
}
