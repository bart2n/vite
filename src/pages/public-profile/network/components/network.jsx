import { useState, useMemo } from 'react';
import { CardConnection, CardConnectionRow } from '@/partials/cards';
import { LayoutGrid, List } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useGetInstitutionDetailQuery } from '../../../../redux/Profile/profileApi';
import Cookies from 'js-cookie';

const IMG_BASE = 'http://localhost:8000';

const Network = () => {
  const [activeView, setActiveView] = useState('cards');
  const id = Cookies.get('user_id');
  const { data: detail, isLoading } = useGetInstitutionDetailQuery(id);

  // Güvenli default
  const followers = useMemo(() => detail?.followers ?? [], [detail]);
  const followings = useMemo(() => detail?.followings ?? [], [detail]);

  // API kullanıcı nesnesini CardConnection’ın beklediği yapıya çevir
  const toCardItem = (u, connectedDefault = false) => {
    console.log("u:",u);
    const hasAvatar = !!u?.avatar;
    console.log("hasAvatar", hasAvatar);
    console.log("u.avatar?.startsWith('http')", u.avatar?.startsWith('http'));
    const avatar = hasAvatar
      ? {
          className: 'size-20 relative',
          image: u.avatar?.startsWith('http')
            ? u.avatar
            : `http://localhost:8000${u.avatar}`, // Eğer zaten tam URL değilse, prepend et
          imageClass: 'rounded-full',
          badgeClass:
            'flex size-2.5 bg-green-500 rounded-full absolute bottom-0.5 start-16 transform -translate-y-1/2',
        }
      : {
          className:
            'flex items-center justify-center relative text-2xl text-info size-20 ring-1 ring-violet-200 bg-violet-50 rounded-full',
          fallback: (u?.username?.[0] || '?').toUpperCase(),
          badgeClass:
            'flex size-2.5 bg-green-500 rounded-full absolute bottom-0.5 start-16 transform -translate-y-1/2',
        };
  
    return {
      name: u?.username || '—',
      info: u?.city || '',
      avatar,
      email: u?.email || '',
      team: { size: 'size-7', group: [] },
      statistics: [],
      connected: connectedDefault,
    };
  };
  const followerItems = followers.map((u) => toCardItem(u, false));
  const followingItems = followings.map((u) => toCardItem(u, true));

  console.log("followeItems", followerItems);

  const renderCard = (item, i) => (
    <CardConnection key={i} {...item} />
  );

  const renderRow = (item, i) => (
    <CardConnectionRow key={i} {...item} />
  );

  return (
    <div className="flex flex-col items-stretch gap-5 lg:gap-7.5">
      {/* Üst bar (toplam bağlantı: followers + followings) */}
      <div className="flex flex-wrap items-center gap-5 justify-between">
        <h3 className="text-lg text-mono font-semibold">
          {isLoading ? 'Loading…' : `${followerItems.length + followingItems.length} Connections`}
        </h3>
        <ToggleGroup
          type="single"
          variant="outline"
          value={activeView}
          onValueChange={(v) => v && setActiveView(v)}
        >
          <ToggleGroupItem value="cards">
            <LayoutGrid size={16} />
          </ToggleGroupItem>
          <ToggleGroupItem value="list">
            <List size={16} />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Followers */}
      <div className="flex flex-col gap-3">
        <h4 className="text-base font-semibold">
          {isLoading ? 'Followers' : `Followers (${followerItems.length})`}
        </h4>

        {activeView === 'cards' ? (
          <div id="followers_cards">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-7.5">
              {(isLoading ? [] : followerItems).map(renderCard)}
            </div>
            {!isLoading && (
              <div className="flex grow justify-center pt-5 lg:pt-7.5">
                <Button mode="link" underlined="dashed" asChild>
                  <Link to="/account/members/team-info">Show more Connections</Link>
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div id="followers_list">
            <div className="flex flex-col gap-5 lg:gap-7.5">
              {(isLoading ? [] : followerItems).map(renderRow)}
            </div>
            {!isLoading && (
              <div className="flex grow justify-center pt-5 lg:pt-7.5">
                <Button mode="link" underlined="dashed" asChild>
                  <Link to="/account/members/team-info">Show more Connections</Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Following */}
      <div className="flex flex-col gap-3">
        <h4 className="text-base font-semibold">
          {isLoading ? 'Following' : `Following (${followingItems.length})`}
        </h4>

        {activeView === 'cards' ? (
          <div id="following_cards">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-7.5">
              {(isLoading ? [] : followingItems).map(renderCard)}
            </div>
            {!isLoading && (
              <div className="flex grow justify-center pt-5 lg:pt-7.5">
                <Button mode="link" underlined="dashed" asChild>
                  <Link to="/account/members/team-info">Show more Connections</Link>
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div id="following_list">
            <div className="flex flex-col gap-5 lg:gap-7.5">
              {(isLoading ? [] : followingItems).map(renderRow)}
            </div>
            {!isLoading && (
              <div className="flex grow justify-center pt-5 lg:pt-7.5">
                <Button mode="link" underlined="dashed" asChild>
                  <Link to="/account/members/team-info">Show more Connections</Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export { Network };
