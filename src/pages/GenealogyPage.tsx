import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { TreeNode, LevelStat } from '../types';
import {
  Network,
  Users,
  Search,
  ChevronRight,
  User,
  Plus,
  Copy,
  Check,
  CheckCircle2,
  Calendar,
  Wallet,
  RotateCcw,
  Sparkles,
  Layers,
  Activity,
  AlertTriangle,
  Flame,
  Filter,
  Eye,
  Info,
  ShieldCheck,
  TrendingUp,
  BarChart3
} from 'lucide-react';

interface GenealogyPageProps {
  onRegisterWithSponsor?: (refId: string) => void;
}

export const GenealogyPage: React.FC<GenealogyPageProps> = ({ onRegisterWithSponsor }) => {
  const { user } = useAuth();
  const [rootId, setRootId] = useState<string>(user?.id || 'usr_root');
  const [treeData, setTreeData] = useState<TreeNode | null>(null);
  const [levelStats, setLevelStats] = useState<LevelStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedRef, setCopiedRef] = useState<string | null>(null);
  const [searchRef, setSearchRef] = useState('');
  const [searchError, setSearchError] = useState<string | null>(null);
  const [viewDepth, setViewDepth] = useState<number>(3); // initial tree view depth for readability, expandable to 8
  const [historyStack, setHistoryStack] = useState<{ id: string; name: string; refId: string }[]>([]);

  // Network Saturation Visualization Controls
  const [saturationHeatmap, setSaturationHeatmap] = useState<boolean>(true);
  const [highlightUnderperformingOnly, setHighlightUnderperformingOnly] = useState<boolean>(false);
  const [showSaturationLegend, setShowSaturationLegend] = useState<boolean>(true);

  useEffect(() => {
    if (user && !historyStack.length) {
      setRootId(user.id);
      setHistoryStack([{ id: user.id, name: user.fullName, refId: user.referralId }]);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!rootId) return;
    fetchTreeAndStats(rootId);
  }, [rootId, viewDepth]);

  const fetchTreeAndStats = async (id: string) => {
    setLoading(true);
    setSearchError(null);
    try {
      const [treeRes, statsRes] = await Promise.all([
        fetch(`/api/user/tree/${id}?depth=${viewDepth}`),
        fetch(`/api/user/level-stats/${id}`),
      ]);

      if (treeRes.ok) {
        const t = await treeRes.json();
        setTreeData(t.tree);
      }
      if (statsRes.ok) {
        const s = await statsRes.json();
        setLevelStats(s.stats || []);
      }
    } catch (err) {
      console.error('Error fetching tree:', err);
    } finally {
      setLoading(false);
    }
  };

  const drillDownToMember = (node: TreeNode) => {
    setHistoryStack((prev) => [...prev, { id: node.id, name: node.name, refId: node.referralId }]);
    setRootId(node.id);
  };

  const jumpToBreadcrumb = (index: number) => {
    const target = historyStack[index];
    setHistoryStack((prev) => prev.slice(0, index + 1));
    setRootId(target.id);
  };

  const handleSearchJump = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchRef.trim()) return;
    setSearchError(null);

    try {
      const res = await fetch(`/api/sponsor/check/${encodeURIComponent(searchRef.trim().toUpperCase())}`);
      const data = await res.json();
      if (res.ok && data.valid) {
        const memRes = await fetch(`/api/admin/members?search=${encodeURIComponent(searchRef.trim())}`);
        if (memRes.ok) {
          const mData = await memRes.json();
          const target = mData.members?.find((m: any) => m.referralId.toUpperCase() === searchRef.trim().toUpperCase());
          if (target) {
            drillDownToMember({
              id: target.id,
              name: target.fullName,
              referralId: target.referralId,
              joinedDate: target.createdAt,
              status: target.status,
              level: 0,
              directCount: target.directCount || 0,
              children: [],
            });
            setSearchRef('');
            return;
          }
        }
      }
      setSearchError('Member referral ID not found.');
    } catch (err) {
      setSearchError('Search failed.');
    }
  };

  const copyInviteForSlot = (parentRefId: string) => {
    const url = `${window.location.origin}/?tab=register&ref=${parentRefId}`;
    navigator.clipboard.writeText(url);
    setCopiedRef(parentRefId);
    setTimeout(() => setCopiedRef(null), 2500);
  };

  // Compute Network Saturation Analytics across visible tree
  const saturationStats = useMemo(() => {
    if (!treeData) {
      return {
        totalNodes: 0,
        optimalCount: 0,
        moderateCount: 0,
        underperformingCount: 0,
        healthScore: 0,
      };
    }

    let total = 0;
    let optimal = 0;
    let moderate = 0;
    let underperforming = 0;
    let totalDirects = 0;

    const traverse = (node: TreeNode | null) => {
      if (!node) return;
      total++;
      totalDirects += node.directCount;
      if (node.directCount === 3) optimal++;
      else if (node.directCount >= 1) moderate++;
      else underperforming++;

      if (node.children) {
        for (const child of node.children) {
          if (child) traverse(child);
        }
      }
    };

    traverse(treeData);

    const maxDirectCapacity = total * 3;
    const healthScore = maxDirectCapacity > 0 ? Math.round((totalDirects / maxDirectCapacity) * 100) : 0;

    return {
      totalNodes: total,
      optimalCount: optimal,
      moderateCount: moderate,
      underperformingCount: underperforming,
      healthScore,
    };
  }, [treeData]);

  // Recursive Tree Node Renderer with Network Saturation Color-Coding
  const renderTreeNode = (node: TreeNode | null, parentRefId?: string, slotIndex?: number): React.ReactNode => {
    // Vacant Slot Case
    if (!node) {
      const isDimmed = highlightUnderperformingOnly;
      return (
        <div className={`flex flex-col items-center transition duration-300 ${isDimmed ? 'opacity-40' : 'opacity-100'}`}>
          <div className="w-52 p-3 rounded-2xl border-2 border-dashed border-slate-700 bg-slate-950/60 text-center hover:border-amber-500/60 transition group shadow-md">
            <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center mx-auto mb-1 group-hover:bg-amber-500/20 group-hover:text-amber-400 transition">
              <Plus className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-slate-400 group-hover:text-amber-400">
              Vacant Direct Slot {slotIndex !== undefined ? `#${slotIndex + 1}` : ''}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Available for member registration</p>
            {parentRefId && (
              <button
                type="button"
                onClick={() => copyInviteForSlot(parentRefId)}
                className="mt-2 w-full py-1 bg-slate-800 hover:bg-rose-600 text-amber-300 hover:text-white rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition"
              >
                {copiedRef === parentRefId ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                {copiedRef === parentRefId ? 'Link Copied!' : 'Copy Slot Invite'}
              </button>
            )}
          </div>
        </div>
      );
    }

    const isCurrentRoot = node.id === rootId;
    const isDirectsFull = node.directCount >= 3;
    const isUnderperforming = node.directCount === 0;
    const isModerate = node.directCount >= 1 && node.directCount < 3;
    const isBlocked = node.status === 'blocked';

    // Saturation percentage
    const saturationPercentage = Math.round((node.directCount / 3) * 100);

    // Dimming logic when admin enables "Highlight Underperforming Only"
    const shouldDim = highlightUnderperformingOnly && !isUnderperforming;

    // Node Box Styling based on Network Saturation
    let saturationCardStyle = 'bg-slate-900 border-slate-800 hover:border-slate-600';
    let saturationGlow = '';
    let badgeText = `${node.directCount}/3 Directs`;
    let badgeStyle = 'bg-slate-800 text-slate-300';
    let alertLabel = null;

    if (saturationHeatmap) {
      if (isBlocked) {
        saturationCardStyle = 'bg-red-950/40 border-red-800 ring-1 ring-red-600/30';
        badgeStyle = 'bg-red-900/50 text-red-200 border border-red-700';
        badgeText = 'SUSPENDED';
        alertLabel = 'Blocked Account';
      } else if (isDirectsFull) {
        // High Saturation / Optimal Activity (3/3 Directs)
        saturationCardStyle = 'bg-gradient-to-b from-emerald-950/60 to-slate-900 border-emerald-500/80 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/30';
        saturationGlow = 'text-emerald-400';
        badgeStyle = 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40';
        badgeText = '100% Saturated (3/3)';
      } else if (isModerate) {
        // Moderate Activity / Growing Branch (1-2/3 Directs)
        saturationCardStyle = 'bg-gradient-to-b from-amber-950/50 to-slate-900 border-amber-500/70 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/30';
        saturationGlow = 'text-amber-400';
        badgeStyle = 'bg-amber-500/20 text-amber-300 border border-amber-500/40';
        badgeText = `${saturationPercentage}% Growing (${node.directCount}/3)`;
      } else {
        // Underperforming / Stagnant Branch (0/3 Directs) - CRITICAL ATTENTION
        saturationCardStyle = 'bg-gradient-to-b from-rose-950/70 via-slate-900 to-slate-900 border-rose-500 shadow-xl shadow-rose-500/25 ring-2 ring-rose-500/50 animate-pulse-slow';
        saturationGlow = 'text-rose-400 font-bold';
        badgeStyle = 'bg-rose-500/30 text-rose-200 border border-rose-500 font-extrabold';
        badgeText = '⚠️ 0% Underperforming (0/3)';
        alertLabel = 'Stagnant Branch / Bottleneck';
      }
    }

    if (isCurrentRoot) {
      saturationCardStyle += ' ring-2 ring-amber-400/50';
    }

    return (
      <div className={`flex flex-col items-center transition-all duration-300 ${shouldDim ? 'opacity-35 hover:opacity-100' : 'opacity-100'}`}>
        {/* Node Box */}
        <div
          onClick={() => !isCurrentRoot && drillDownToMember(node)}
          className={`w-60 p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer relative ${saturationCardStyle} ${
            !isCurrentRoot ? 'hover:scale-[1.03]' : ''
          }`}
        >
          {/* Underperforming Alert Beacon for Admins */}
          {saturationHeatmap && isUnderperforming && !isBlocked && (
            <div className="absolute -top-2.5 -right-2 bg-rose-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-lg border border-white/20 flex items-center gap-1 animate-bounce">
              <AlertTriangle className="w-2.5 h-2.5" />
              Underperforming
            </div>
          )}

          {/* Top Row: Level & Referral ID */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <div className="flex items-center gap-1.5">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                  isCurrentRoot ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-800 text-rose-400'
                }`}
              >
                {node.level === 0 ? 'Root' : `L${node.level}`}
              </div>
              <span className="font-mono text-xs font-black text-amber-300">{node.referralId}</span>
            </div>

            <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${badgeStyle}`}>
              {badgeText}
            </span>
          </div>

          {/* Member Name & Join Date */}
          <div className="mt-2 text-left">
            <div className="font-bold text-white text-xs truncate flex items-center justify-between" title={node.name}>
              <span>{node.name}</span>
              {saturationHeatmap && isDirectsFull && (
                <span title="High Velocity Branch">
                  <Flame className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                </span>
              )}
            </div>
            <div className="text-[10px] text-slate-400 flex items-center justify-between mt-0.5">
              <span className="flex items-center gap-1">
                <Calendar className="w-2.5 h-2.5 text-slate-500" />
                {new Date(node.joinedDate).toLocaleDateString()}
              </span>
              <span className="font-mono text-slate-400 text-[10px]">
                Downline: <strong className="text-white">{node.totalDownlineCount ?? 0}</strong>
              </span>
            </div>
          </div>

          {/* Direct Saturation Segmented Bar (3 Slots) */}
          <div className="mt-2.5 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-[10px] mb-1">
              <span className="text-slate-400 font-medium">Direct Saturation:</span>
              <span className={`font-mono font-bold ${saturationGlow || 'text-white'}`}>
                {node.directCount} / 3 slots ({saturationPercentage}%)
              </span>
            </div>

            {/* 3-Slot Visual Indicator */}
            <div className="grid grid-cols-3 gap-1 h-1.5 rounded-full overflow-hidden bg-slate-950 p-0.5 border border-slate-800">
              {[0, 1, 2].map((slotIdx) => {
                const isFilled = slotIdx < node.directCount;
                return (
                  <div
                    key={slotIdx}
                    className={`h-full rounded-sm transition-all ${
                      isFilled
                        ? isDirectsFull
                          ? 'bg-emerald-400 shadow-sm shadow-emerald-400'
                          : 'bg-amber-400'
                        : isUnderperforming
                        ? 'bg-rose-900/60 border border-rose-500/40'
                        : 'bg-slate-800'
                    }`}
                  />
                );
              })}
            </div>

            {/* Bottleneck Warning / Action helper */}
            {alertLabel && (
              <div className="mt-1.5 text-[9px] font-bold text-rose-400 flex items-center justify-between">
                <span>{alertLabel}</span>
                <span className="underline hover:text-white">Needs Downline</span>
              </div>
            )}
          </div>

          {!isCurrentRoot && (
            <div className="mt-2 text-center text-[10px] font-bold text-amber-400 hover:text-white hover:underline flex items-center justify-center gap-1">
              <span>Drill into branch</span>
              <span>&rarr;</span>
            </div>
          )}
        </div>

        {/* Connector Lines & Children */}
        {node.children && node.children.length > 0 && (
          <div className="flex flex-col items-center mt-2 w-full">
            {/* Vertical stem down */}
            <div className={`w-0.5 h-6 ${isUnderperforming ? 'bg-rose-700/80' : 'bg-slate-700'}`}></div>

            {/* Children container with horizontal bar */}
            <div className="relative flex items-start justify-center gap-6 pt-2">
              {/* Horizontal line across children */}
              <div className="absolute top-0 left-12 right-12 h-0.5 bg-slate-700"></div>

              {node.children.map((child, idx) => (
                <div key={child ? child.id : `vacant-${node.id}-${idx}`} className="relative flex flex-col items-center">
                  {/* Vertical line to child */}
                  <div className="w-0.5 h-4 bg-slate-700 -mt-2 mb-2"></div>
                  {renderTreeNode(child, node.referralId, idx)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold mb-2 border border-purple-500/30">
            <Activity className="w-3.5 h-3.5 text-purple-400" />
            <span>Network Saturation &amp; Branch Velocity Visualizer</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Network Genealogy &amp; Saturation</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time heat-mapping of activity levels across all 8 matrix levels to identify high-performing and stagnant network branches.
          </p>
        </div>

        {/* Search Jump by Referral ID */}
        <div className="flex flex-wrap items-center gap-3">
          <form onSubmit={handleSearchJump} className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={searchRef}
              onChange={(e) => setSearchRef(e.target.value.toUpperCase())}
              placeholder="Jump to Ref ID (e.g. SRM-1002)"
              className="pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 w-60"
            />
          </form>

          {/* Depth selector */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
            <span className="px-2 text-slate-400 font-medium">Depth:</span>
            {[2, 3, 4, 8].map((d) => (
              <button
                key={d}
                onClick={() => setViewDepth(d)}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                  viewDepth === d ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                {d === 8 ? '8 Levels (Full)' : `${d} L`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {searchError && (
        <div className="p-3 bg-red-950/60 border border-red-800 rounded-xl text-red-300 text-xs">
          {searchError}
        </div>
      )}

      {/* Network Saturation Intelligence Dashboard */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <span>Branch Saturation &amp; Bottleneck Analysis</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Live Audit
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Color-coded audit to immediately pinpoint stagnant members and assist downline placement.
              </p>
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              onClick={() => setSaturationHeatmap(!saturationHeatmap)}
              className={`px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-2 border ${
                saturationHeatmap
                  ? 'bg-amber-600 text-white border-amber-500 shadow-md shadow-amber-600/30'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Saturation Heatmap: {saturationHeatmap ? 'ON' : 'OFF'}
            </button>

            <button
              onClick={() => setHighlightUnderperformingOnly(!highlightUnderperformingOnly)}
              className={`px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-2 border ${
                highlightUnderperformingOnly
                  ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/30 ring-2 ring-rose-500/40'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
              {highlightUnderperformingOnly ? 'Highlighting Bottlenecks' : 'Highlight Underperforming (0/3)'}
            </button>
          </div>
        </div>

        {/* Saturation Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          {/* Network Health Score */}
          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              Network Health Index
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-amber-400 font-mono">
                {saturationStats.healthScore}%
              </span>
              <span className="text-[11px] text-slate-500">Saturation</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 rounded-full"
                style={{ width: `${saturationStats.healthScore}%` }}
              />
            </div>
          </div>

          {/* Saturated / Optimal Nodes */}
          <div className="p-4 bg-emerald-950/20 rounded-2xl border border-emerald-500/30 flex flex-col justify-between">
            <div className="flex items-center justify-between text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
              <span>High Activity (3/3)</span>
              <Flame className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white font-mono mt-1">
              {saturationStats.optimalCount} <span className="text-xs text-slate-400">nodes</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-medium mt-1">
              100% Saturated • High Velocity
            </span>
          </div>

          {/* Growing / Moderate Nodes */}
          <div className="p-4 bg-amber-950/20 rounded-2xl border border-amber-500/30 flex flex-col justify-between">
            <div className="flex items-center justify-between text-amber-400 text-[10px] font-bold uppercase tracking-wider">
              <span>Moderate (1-2/3)</span>
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-white font-mono mt-1">
              {saturationStats.moderateCount} <span className="text-xs text-slate-400">nodes</span>
            </div>
            <span className="text-[10px] text-amber-300 font-medium mt-1">
              Active Growth • 1-2 Directs
            </span>
          </div>

          {/* Underperforming Nodes (Bottlenecks) */}
          <div
            onClick={() => setHighlightUnderperformingOnly(!highlightUnderperformingOnly)}
            className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
              highlightUnderperformingOnly
                ? 'bg-rose-950/60 border-rose-500 ring-2 ring-rose-500/40'
                : 'bg-rose-950/20 border-rose-500/40 hover:bg-rose-950/40'
            }`}
          >
            <div className="flex items-center justify-between text-rose-400 text-[10px] font-bold uppercase tracking-wider">
              <span>Underperforming (0/3)</span>
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            </div>
            <div className="text-2xl font-black text-rose-400 font-mono mt-1">
              {saturationStats.underperformingCount} <span className="text-xs text-slate-400">nodes</span>
            </div>
            <span className="text-[10px] text-rose-300 font-bold mt-1">
              {highlightUnderperformingOnly ? 'Click to show all' : 'Click to highlight on tree'}
            </span>
          </div>
        </div>

        {/* Color-Coding Legend */}
        {showSaturationLegend && (
          <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800 text-xs flex flex-wrap items-center justify-between gap-3 text-slate-300">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Heatmap Legend:</span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-400"></span>
                <span><strong>High Saturation (3/3):</strong> Full direct downline capacity</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm shadow-amber-400"></span>
                <span><strong>Moderate Activity (1-2/3):</strong> Developing branch</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500 shadow-sm shadow-rose-400 animate-pulse"></span>
                <span className="text-rose-300 font-bold"><strong>Underperforming (0/3):</strong> Stagnant / Needs immediate attention</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full border border-dashed border-slate-500 bg-slate-800"></span>
                <span className="text-slate-400"><strong>Vacant Slot:</strong> Available to sponsor</span>
              </div>
            </div>

            <button
              onClick={() => setShowSaturationLegend(false)}
              className="text-[10px] text-slate-500 hover:text-slate-300 ml-auto"
            >
              Hide Legend
            </button>
          </div>
        )}
      </div>

      {/* Breadcrumbs */}
      <div className="flex items-center flex-wrap gap-2 text-xs bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <span className="text-slate-500 font-semibold">Tree Focus:</span>
        {historyStack.map((item, idx) => (
          <React.Fragment key={item.id}>
            {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-600" />}
            <button
              onClick={() => jumpToBreadcrumb(idx)}
              className={`font-semibold hover:underline flex items-center gap-1 ${
                idx === historyStack.length - 1 ? 'text-amber-400 font-bold' : 'text-slate-300'
              }`}
            >
              <span>{item.name}</span>
              <span className="font-mono text-[10px] text-slate-500">({item.refId})</span>
            </button>
          </React.Fragment>
        ))}
        {historyStack.length > 1 && (
          <button
            onClick={() => jumpToBreadcrumb(0)}
            className="ml-auto text-rose-400 hover:underline text-xs font-bold flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Reset to My Root
          </button>
        )}
      </div>

      {/* Tree Visualization Canvas */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl overflow-x-auto min-h-[500px]">
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-sm animate-pulse flex items-center justify-center gap-2">
            <Activity className="w-4 h-4 animate-spin text-amber-400" />
            Analyzing network saturation &amp; rendering 3x8 matrix tree...
          </div>
        ) : treeData ? (
          <div className="min-w-fit flex justify-center py-4">
            {renderTreeNode(treeData)}
          </div>
        ) : (
          <div className="py-20 text-center text-slate-500 text-sm">
            No network tree found for this member.
          </div>
        )}
      </div>

      {/* 8-Level Downline Statistics Matrix Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-black text-white">8-Level Downline Matrix Performance</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live count and earnings generated from your 8 levels of team depth.
            </p>
          </div>
          <div className="text-xs bg-rose-950/60 border border-rose-800/40 text-rose-300 px-3 py-1 rounded-full font-bold">
            Hard Cut-off at Level 8 (Level 9+ ₹0)
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[11px] font-extrabold tracking-wider">
                <th className="py-3 px-4">Level</th>
                <th className="py-3 px-4">Max Capacity</th>
                <th className="py-3 px-4">Filled Members</th>
                <th className="py-3 px-4">Saturation Ratio</th>
                <th className="py-3 px-4">Rate / Member</th>
                <th className="py-3 px-4">Total Earned</th>
                <th className="py-3 px-4">Max Potential</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {levelStats.map((stat) => {
                const percent = Math.min(100, Math.round((stat.currentMembers / stat.maxMembers) * 100));
                return (
                  <tr key={stat.level} className="hover:bg-slate-850">
                    <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-amber-400 font-mono text-xs flex items-center justify-center font-bold">
                        {stat.level}
                      </span>
                      <span>Level {stat.level}</span>
                      {stat.level === 1 && (
                        <span className="text-[10px] text-rose-400 font-bold bg-rose-500/10 px-1.5 py-0.2 rounded border border-rose-500/20">
                          Directs
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {stat.maxMembers.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      {stat.currentMembers.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 w-40">
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              percent >= 80
                                ? 'bg-emerald-400'
                                : percent >= 30
                                ? 'bg-amber-400'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${Math.max(percent, stat.currentMembers > 0 ? 5 : 0)}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 font-bold">{percent}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-amber-400">
                      ₹{stat.commissionPerMember}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                      ₹{stat.totalEarned.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      ₹{stat.maxPotential.toLocaleString('en-IN')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-950 font-black text-white border-t-2 border-slate-700">
                <td className="py-3.5 px-4">Cumulative Total</td>
                <td className="py-3.5 px-4 font-mono text-amber-400">9,840 Members</td>
                <td className="py-3.5 px-4 font-mono text-white">
                  {levelStats.reduce((s, x) => s + x.currentMembers, 0)} Members
                </td>
                <td className="py-3.5 px-4">—</td>
                <td className="py-3.5 px-4">—</td>
                <td className="py-3.5 px-4 font-mono text-emerald-400 text-base">
                  ₹{levelStats.reduce((s, x) => s + x.totalEarned, 0).toLocaleString('en-IN')}
                </td>
                <td className="py-3.5 px-4 font-mono text-emerald-400 text-base">
                  ₹99,120 Max
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
