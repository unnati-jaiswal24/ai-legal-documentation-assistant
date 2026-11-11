import { Link } from 'react-router-dom';
import { Settings as SettingsIcon, UserRound } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';

export default function Settings() {
  return (
    <div>
      <PageHeader
        eyebrow="Workspace"
        title="Settings"
        description="Manage account preferences and application options."
      />
      <Card className="p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eff3ed] text-[#58765b] dark:bg-[#29352b] dark:text-[#b4c8b1]">
            <SettingsIcon size={18} />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-[#354136] dark:text-[#e0e6df]">Account settings are not available yet</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#747c73] dark:text-[#adb6ab]">
              The backend currently has no settings or preference endpoints. To avoid saving changes that would not persist, this page does not display editable settings.
            </p>
            <Button as={Link} to="/profile" variant="outline" className="mt-5"><UserRound size={15} /> View profile</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
