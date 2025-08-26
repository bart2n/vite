import { Fragment } from 'react';
import { PageMenu } from '@/pages/public-profile';
import { UserHero } from '@/partials/common/user-hero';
import { DropdownMenu9 } from '@/partials/dropdown-menu/dropdown-menu-9';
import { Navbar, NavbarActions } from '@/partials/navbar/navbar';
import {
  EllipsisVertical,
  Mail,
  MapPin,
  MessagesSquare,
  Users,
  Zap,
} from 'lucide-react';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/common/container';
import { ProfileActivityContent } from '.';
import { useGetUserInstitutionsQuery } from '../../../redux/Auth/authApi';

export function ProfileActivityPage() {
  const {data:InstitutionData,isLoading:loading} = useGetUserInstitutionsQuery();
  const inst = Array.isArray(InstitutionData) ? InstitutionData[0] : undefined;

  const image = (
    <img
      src={toAbsoluteUrl(`http://localhost:8000${inst.avatar}`)}
      className="rounded-full border-3 border-green-500 size-[100px] shrink-0"
      alt="image"
    />
  );

  return (
    <Fragment>
      <UserHero
        name={inst.username}
        image={image}
        info={[
        ]}
      />

      <Container>
        <Navbar>
          <PageMenu />
          <NavbarActions>
            <Button>
              <Users /> Connect
            </Button>
            <Button variant="outline" mode="icon">
              <MessagesSquare size={16} />
            </Button>
            <DropdownMenu9
              trigger={
                <Button variant="outline" mode="icon">
                  <EllipsisVertical />
                </Button>
              }
            />
          </NavbarActions>
        </Navbar>
      </Container>
      <Container>
        <div className="flex flex-wrap items-center gap-5 justify-between mb-7.5">
          <h3 className="text-lg text-mono font-semibold">Activity</h3>
        </div>
        <ProfileActivityContent />
      </Container>
    </Fragment>
  );
}
