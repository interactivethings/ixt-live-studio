import TeamCommunication from '@/components/team-communication/TeamCommunication';
import { DisplayProvider } from '@/contexts/display-context';

const homePage = async () => {
  return (
    <div className="w-full h-full">
      <DisplayProvider>
        <TeamCommunication />
      </DisplayProvider>
    </div>
  );
};

export default homePage;
