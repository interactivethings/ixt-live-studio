import Scene from '@/components/setup/Scene';
import Setup from '@/components/setup/Setup';
import { ChartProvider } from '@/contexts/chart-context';
import { DisplayProvider } from '@/contexts/display-context';

const homePage = async () => {
  return (
    <div className="w-full h-full">
      <DisplayProvider>
        <ChartProvider>
          <Setup>
            <Scene />
          </Setup>
        </ChartProvider>
      </DisplayProvider>
    </div>
  );
};

export default homePage;
