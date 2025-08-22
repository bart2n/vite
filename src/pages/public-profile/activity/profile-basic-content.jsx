import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useGetInstitutionTimelineQuery } from '../../../redux/Profile/profileApi';
import Cookies from "js-cookie";
import { skipToken } from '@tanstack/react-query';

export function ProfileActivityContent() {
  const [isSwitchOn, setIsSwitchOn] = useState(false);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const id = Cookies.get("user_id");
  console.log(id);
  const { data: timeline, isLoading: loading } = useGetInstitutionTimelineQuery({id} ?? skipToken);

  // Normalize to an array
  const items = useMemo(() => {
    if (!timeline) return [];
    return Array.isArray(timeline) ? timeline : (timeline.results ?? []);
  }, [timeline]);

  // Group by year and sort each group by date (newest first)
  const itemsByYear = useMemo(() => {
    const map = {};
    for (const it of items) {
      const y = new Date(it.created_at).getFullYear();
      if (!map[y]) map[y] = [];
      map[y].push(it);
    }
    Object.keys(map).forEach((y) => {
      map[y].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });
    return map;
  }, [items]);

  // Year list (from data; fallback to last 8 years if empty)
  const years = useMemo(() => {
    const keys = Object.keys(itemsByYear).map((x) => parseInt(x, 10));
    if (keys.length) return keys.sort((a, b) => b - a);
    return Array.from({ length: 8 }, (_, i) => new Date().getFullYear() - i);
  }, [itemsByYear]);

  // Ensure currentYear is valid
  useEffect(() => {
    if (!years.includes(currentYear) && years.length > 0) {
      setCurrentYear(years[0]);
    }
  }, [years, currentYear]);

  const activeYearItems = itemsByYear[currentYear] ?? [];

  return (
    <div className="flex gap-5 lg:gap-7.5">
      <Card className="grow" id={`activity_${currentYear}`}>
        <CardHeader>
          <CardTitle>Activity</CardTitle>
          <div className="flex items-center space-x-2.5">
            <Label htmlFor="simple-switch" className="text-sm">
              Auto refresh:
            </Label>
            {isSwitchOn ? 'On' : 'Off'}
            <Switch
              id="simple-switch"
              size="sm"
              className="ms-2"
              checked={isSwitchOn}
              onCheckedChange={() => setIsSwitchOn((s) => !s)}
            />
          </div>
        </CardHeader>

        <CardContent>
          {loading && (
            <div className="space-y-3">
              <div className="h-4 w-2/3 bg-muted rounded" />
              <div className="h-20 w-full bg-muted rounded" />
              <div className="h-20 w-full bg-muted rounded" />
            </div>
          )}

          {!loading && activeYearItems.length === 0 && (
            <div className="text-sm text-muted-foreground">
              No activity for {currentYear}.
            </div>
          )}

          {!loading &&
            activeYearItems.map((item) => (
              <div key={item.id} className="mb-4 p-4 rounded-lg border bg-card">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-base font-medium">
                    {item.message?.slice(0, 60) || 'Activity'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(item.created_at).toLocaleDateString()}
                  </div>
                </div>
                {item.message && (
                  <p className="text-sm text-foreground/80 whitespace-pre-line">
                    {item.message}
                  </p>
                )}
              </div>
            ))}
        </CardContent>

        <CardFooter className="justify-center">
          <Button mode="link" underlined="dashed" asChild>
            <Link to="#">All-time Activity</Link>
          </Button>
        </CardFooter>
      </Card>

      <div className="flex flex-col gap-2.5">
        {years.map((year) => (
          <Button
            key={year}
            variant={year === currentYear ? 'primary' : 'dim'}
            appearance="ghost"
            size="sm"
            className="justify-start gap-1"
            onClick={() => setCurrentYear(year)}
          >
            {year}
          </Button>
        ))}
      </div>
    </div>
  );
}
