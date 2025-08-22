import {
  About,
  CommunityBadges,
  Contributions,
  Contributors,
  MediaUploads,
  Projects,
  RecentUploads,
  Tags,
  UnlockPartnerships,
  WorkExperience,
} from './components';

export function ProfileDefaultContent() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 lg:gap-7.5">
      <div className="col-span-1">
        <div className="grid gap-5 lg:gap-7.5">
          <About />
        </div>
      </div>
      <div className="col-span-2">
        <div className="flex flex-col gap-5 lg:gap-7.5">
          <div className="flex flex-col gap-5 lg:gap-7.5">
            <MediaUploads />
          </div>
        </div>
      </div>
    </div>
  );
}
