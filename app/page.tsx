import Screen from '@/components/display/Screen';
import { DisplayProvider } from '@/contexts/display-context';

const homePage = async () => {
  return (
    <div className="w-full h-full">
      <DisplayProvider>
        <Screen>
          <text x="50%" y="50%" textAnchor="middle" fill="white">
            Hello, World
          </text>
        </Screen>
      </DisplayProvider>
    </div>
  );
};

export default homePage;
