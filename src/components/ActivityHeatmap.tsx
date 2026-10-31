import React, { useMemo, useState } from 'react';
import {
  GitCommit,
  GitPullRequest,
  PlusCircle,
  Calendar,
  Flame,
  Activity,
  Layers,
  Clock,
  HardDrive,
  Moon,
  Sun,
  Zap,
} from 'lucide-react';
import { GitHubEvent, GitHubRepo, GitHubUser } from '../types/github';

interface ActivityHeatmapProps {
  user: GitHubUser;
  repos: GitHubRepo[];
  events: GitHubEvent[];
}

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({
  user,
  repos,
  events,
}) => {
  const [selectedCell, setSelectedCell] = useState<{ date: string; count: number } | null>(null);

  // Compute daily activity map for the past ~28 weeks
  const { weeksData, totalActivities, activeDaysCount, maxStreak, currentStreak } = useMemo(() => {
    const activityMap: Record<string, number> = {};

    events.forEach((ev) => {
      const dateKey = ev.created_at.slice(0, 10);
      let count = 1;
      if (ev.type === 'PushEvent' && ev.payload?.commits) {
        count = Math.max(1, ev.payload.commits.length);
      }
      activityMap[dateKey] = (activityMap[dateKey] || 0) + count;
    });

    repos.forEach((repo) => {
      if (repo.created_at) {
        const createDate = repo.created_at.slice(0, 10);
        activityMap[createDate] = (activityMap[createDate] || 0) + 2;
      }
      if (repo.pushed_at) {
        const pushDate = repo.pushed_at.slice(0, 10);
        activityMap[pushDate] = (activityMap[pushDate] || 0) + 1;
      }
    });

    const weeks: Array<Array<{ date: string; count: number; dayOfWeek: number }>> = [];
    const today = new Date();
    const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const numWeeks = 28;
    const totalDays = numWeeks * 7;
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - totalDays + 1);

    let currentWeek: Array<{ date: string; count: number; dayOfWeek: number }> = [];
    let cur = new Date(startDate);

    let total = 0;
    let activeDays = 0;

    while (cur <= endDate) {
      const dateKey = cur.toISOString().slice(0, 10);
      const count = activityMap[dateKey] || 0;
      if (count > 0) {
        total += count;
        activeDays++;
      }

      currentWeek.push({
        date: dateKey,
        count,
        dayOfWeek: cur.getDay(),
      });

      if (currentWeek.length === 7 || cur.getTime() === endDate.getTime()) {
        weeks.push(currentWeek);
        currentWeek = [];
      }

      cur.setDate(cur.getDate() + 1);
    }

    // Calculate streaks
    let curStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date(endDate);
      d.setDate(endDate.getDate() - i);
      const k = d.toISOString().slice(0, 10);
      if (activityMap[k] && activityMap[k] > 0) {
        tempStreak++;
      } else {
        if (tempStreak > longestStreak) longestStreak = tempStreak;
        tempStreak = 0;
      }
    }
    if (tempStreak > longestStreak) longestStreak = tempStreak;

    let checkDay = 0;
    while (checkDay < 14) {
      const d = new Date(endDate);
      d.setDate(endDate.getDate() - checkDay);
      const k = d.toISOString().slice(0, 10);
      if (activityMap[k] && activityMap[k] > 0) {
        curStreak++;
        checkDay++;
      } else if (checkDay === 0) {
        checkDay++;
      } else {
        break;
      }
    }

    return {
      weeksData: weeks,
      totalActivities: total,
      activeDaysCount: activeDays,
      maxStreak: Math.max(longestStreak, curStreak, 1),
      currentStreak: curStreak,
    };
  }, [events, repos]);

  // Compute developer rhythm & productivity
  const rhythmStats = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayCounts = [0, 0, 0, 0, 0, 0, 0];
    let nightCommits = 0;
    let morningCommits = 0;
    let totalTimed = 0;

    events.forEach((ev) => {
      const d = new Date(ev.created_at);
      const day = d.getDay();
      const hour = d.getHours();
      dayCounts[day]++;
      totalTimed++;

      if (hour >= 20 || hour <= 4) {
        nightCommits++;
      } else if (hour >= 5 && hour <= 12) {
        morningCommits++;
      }
    });

    const maxDayCount = Math.max(...dayCounts, 1);
    const dayBars = days.map((dayName, idx) => ({
      name: dayName,
      count: dayCounts[idx],
      percent: Math.round((dayCounts[idx] / maxDayCount) * 100),
    }));

    let archetype = 'Day Focus';
    let ArchetypeIcon = Zap;
    if (totalTimed > 0) {
      if (nightCommits / totalTimed > 0.4) {
        archetype = 'Night Owl';
        ArchetypeIcon = Moon;
      } else if (morningCommits / totalTimed > 0.4) {
        archetype = 'Early Bird';
        ArchetypeIcon = Sun;
      }
    }

    // Disk storage footprint
    const totalKB = repos.reduce((acc, r) => acc + (r.size || 0), 0);
    const totalMB = (totalKB / 1024).toFixed(1);
    const avgKB = repos.length ? Math.round(totalKB / repos.length) : 0;

    return {
      dayBars,
      archetype,
      ArchetypeIcon,
      totalMB,
      avgKB,
    };
  }, [events, repos]);

  // Compute language distribution
  const languageStats = useMemo(() => {
    const map: Record<string, number> = {};
    let total = 0;
    repos.forEach((r) => {
      if (r.language) {
        map[r.language] = (map[r.language] || 0) + 1;
        total++;
      }
    });

    const colors: Record<string, string> = {
      TypeScript: '#3178c6',
      JavaScript: '#f7df1e',
      Python: '#3572A5',
      HTML: '#e34c26',
      CSS: '#563d7c',
      Rust: '#dea584',
      Go: '#00ADD8',
      Java: '#b07219',
      'C++': '#f34b7d',
      Ruby: '#701516',
      PHP: '#4F5D95',
      Markdown: '#083fa1',
    };

    const sorted = Object.entries(map)
      .map(([name, count]) => ({
        name,
        count,
        percent: Math.round((count / (total || 1)) * 100),
        color: colors[name] || '#818cf8',
      }))
      .sort((a, b) => b.count - a.count);

    return { languages: sorted.slice(0, 6), total };
  }, [repos]);

  const getCellColor = (count: number) => {
    if (count === 0) return 'bg-[#151f33] border-slate-800/40';
    if (count <= 2) return 'bg-emerald-950/80 border-emerald-800/60';
    if (count <= 4) return 'bg-emerald-700 border-emerald-600';
    if (count <= 7) return 'bg-emerald-500 border-emerald-400';
    return 'bg-emerald-400 border-emerald-300';
  };

  const ArchetypeIcon = rhythmStats.ArchetypeIcon;

  return (
    <div className="space-y-6">
      {/* Heatmap & Streak Overview Card */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-400" />
              <span>Activity & Commit Contribution Heatmap</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Visual track of repository creations, push commits, and public GitHub actions
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Current Streak:</span>
              <strong className="font-mono text-amber-300 tabular-nums">{currentStreak} days</strong>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>Active Days:</span>
              <strong className="font-mono text-indigo-300 tabular-nums">{activeDaysCount} days</strong>
            </div>
          </div>
        </div>

        {/* Mobile Swipe Hint */}
        <div className="flex sm:hidden items-center justify-between text-[11px] text-indigo-300 bg-indigo-950/40 px-3 py-1.5 rounded-xl border border-indigo-900/50">
          <span className="flex items-center gap-1.5">
            <span>↔</span>
            <span>Swipe horizontally for full 28-week calendar</span>
          </span>
          <span className="font-mono text-slate-400 text-[10px]">Today →</span>
        </div>

        {/* The Grid */}
        <div className="overflow-x-auto pb-2 scrollbar-thin scroll-smooth" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="inline-block min-w-full">
            <div className="flex gap-1.5">
              {weeksData.map((week, wIndex) => (
                <div key={wIndex} className="flex flex-col gap-1.5">
                  {week.map((cell) => (
                    <div
                      key={cell.date}
                      onMouseEnter={() => setSelectedCell({ date: cell.date, count: cell.count })}
                      onMouseLeave={() => setSelectedCell(null)}
                      className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-[3px] border cursor-pointer transition-all hover:scale-125 ${getCellColor(
                        cell.count
                      )}`}
                      title={`${cell.date}: ${cell.count} public activity contributions`}
                    />
                  ))}
                </div>
              ))}
            </div>

            {/* Heatmap Legend & Tooltip readout */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-4 text-xs text-slate-400">
              <div>
                {selectedCell ? (
                  <span className="font-mono text-slate-200">
                    <strong className="text-emerald-400">{selectedCell.count} activities</strong> on{' '}
                    {new Date(selectedCell.date).toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                ) : (
                  <span>Hover over any calendar cell to view date & commits.</span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[11px]">Less</span>
                <div className="w-3 h-3 rounded-[2px] bg-[#151f33] border border-slate-800" />
                <div className="w-3 h-3 rounded-[2px] bg-emerald-950 border border-emerald-800" />
                <div className="w-3 h-3 rounded-[2px] bg-emerald-700 border border-emerald-600" />
                <div className="w-3 h-3 rounded-[2px] bg-emerald-500 border border-emerald-400" />
                <div className="w-3 h-3 rounded-[2px] bg-emerald-400 border border-emerald-300" />
                <span className="text-[11px]">More</span>
              </div>
            </div>
          </div>
        </div>

        {/* Language distribution bar */}
        {languageStats.languages.length > 0 && (
          <div className="pt-4 border-t border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>Ecosystem Language Breakdown</span>
              </span>
              <span className="text-slate-400 font-mono text-[11px]">
                {languageStats.total} classified repositories
              </span>
            </div>

            <div className="w-full h-2.5 rounded-full overflow-hidden flex bg-slate-800">
              {languageStats.languages.map((l) => (
                <div
                  key={l.name}
                  style={{ width: `${l.percent}%`, backgroundColor: l.color }}
                  title={`${l.name}: ${l.count} repos (${l.percent}%)`}
                  className="h-full transition-all"
                />
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs pt-1">
              {languageStats.languages.map((l) => (
                <div key={l.name} className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: l.color }}
                  />
                  <span className="text-slate-300">{l.name}</span>
                  <span className="text-slate-400 font-mono text-[11px] tabular-nums">
                    {l.percent}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Developer Rhythm & Productivity Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Day of Week Commit Distribution */}
        <div className="md:col-span-2 bg-[#0f172a] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>Day-of-Week Commit Frequency</span>
            </span>
            <span className="text-slate-400 font-mono text-[11px]">Recent activity cycle</span>
          </div>

          <div className="grid grid-cols-7 gap-2 pt-2 items-end h-24">
            {rhythmStats.dayBars.map((day) => (
              <div key={day.name} className="flex flex-col items-center gap-1 h-full justify-end">
                <div
                  style={{ height: `${Math.max(12, day.percent)}%` }}
                  className="w-full rounded-t bg-gradient-to-t from-indigo-900 to-indigo-500 hover:to-indigo-400 transition-all cursor-pointer"
                  title={`${day.name}: ${day.count} activities`}
                />
                <span className="text-[11px] font-mono text-slate-400">{day.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Work Rhythm Archetype & Disk Footprint */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <ArchetypeIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>Productivity Rhythm</span>
            </span>
            <h4 className="text-lg font-bold text-white flex items-center gap-2">
              <span>{rhythmStats.archetype}</span>
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Calculated from push event hour timestamps across repositories.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1">
                <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
                <span>Codebase Footprint:</span>
              </span>
              <strong className="text-white font-mono tabular-nums">{rhythmStats.totalMB} MB</strong>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Average Repo Size:</span>
              <span className="font-mono tabular-nums">{rhythmStats.avgKB} KB</span>
            </div>
          </div>
        </div>
      </div>

      {/* Public Activity Timeline Feed */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <GitCommit className="w-4 h-4 text-emerald-400" />
          <span>Recent Activity & Commit Stream</span>
        </h3>

        {events.length === 0 ? (
          <div className="text-xs text-slate-400 py-4 text-center">
            No public event stream in GitHub's recent 90-day window. Repository creation and commit dates are reflected above.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/70 max-h-96 overflow-y-auto pr-1">
            {events.slice(0, 15).map((ev) => {
              const eventDate = new Date(ev.created_at).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              let label = 'Public activity';
              let detail = '';
              let Icon = GitCommit;
              let iconColor = 'text-indigo-400';

              if (ev.type === 'PushEvent') {
                Icon = GitCommit;
                iconColor = 'text-emerald-400';
                const commitCount = ev.payload?.commits?.length || 1;
                label = `Pushed ${commitCount} commit${commitCount > 1 ? 's' : ''}`;
                detail = ev.payload?.commits?.[0]?.message || 'Code update';
              } else if (ev.type === 'CreateEvent') {
                Icon = PlusCircle;
                iconColor = 'text-violet-400';
                label = `Created ${ev.payload?.ref_type || 'repository'}`;
                detail = ev.payload?.ref || ev.repo.name;
              } else if (ev.type === 'PullRequestEvent') {
                Icon = GitPullRequest;
                iconColor = 'text-sky-400';
                label = `${ev.payload?.action || 'Opened'} Pull Request`;
                detail = ev.payload?.pull_request?.title || '';
              } else if (ev.type === 'WatchEvent') {
                label = 'Starred repository';
                iconColor = 'text-amber-400';
              }

              return (
                <div key={ev.id} className="py-3 flex items-start justify-between gap-4 text-xs">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 shrink-0 mt-0.5">
                      <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{label}</span>
                        <span className="text-slate-400">on</span>
                        <a
                          href={`https://github.com/${ev.repo.name}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-indigo-400 hover:underline"
                        >
                          {ev.repo.name}
                        </a>
                      </div>
                      {detail && (
                        <p className="text-slate-400 font-mono text-[11px] line-clamp-1">
                          "{detail}"
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono shrink-0">
                    {eventDate}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
