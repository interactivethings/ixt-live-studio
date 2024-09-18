import Screen from '@/components/display/Screen';
import TeamMembers from '@/components/team-communication/TeamMembers';
import { DisplayProvider } from '@/contexts/display-context';

const homePage = async () => {
  return (
    <div className="w-full h-full">
      <DisplayProvider>
        <Screen>
          <TeamMembers />
        </Screen>
      </DisplayProvider>
    </div>
  );
};

export default homePage;
