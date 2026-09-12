import React, { useState, useEffect } from 'react';
import { 
  Activity, ShieldAlert, ShieldCheck, Search, Filter, 
  ExternalLink, Zap, RefreshCw, Terminal, AlertTriangle 
} from 'lucide-react';
import { IdsTrafficEvent } from '../../types';
import { apiService } from '../../services/api';

interface IdsAnomalyMonitorProps {
  onSelectIpForEnrichment: (ip: string) => void;
  onSelectForContainment: (ip: string, port?: number, reason?: string) => void;
}

export const IdsAnomalyMonitor: React.FC<IdsAnomalyMonitorProps> = ({
  onSelectIpForEnrichment,
  onSelectForContainment,
}) => {
  const [events, setEvents] = useState<IdsTrafficEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'Critical' | 'High'>('ALL');
  const [blockedIps, setBlockedIps] = useState<Set<string>>(new Set());

  const fetchIds = async () => {
    try {
      setIsLoading(true);
      const res = await apiService.getIdsEvents();
      if (res.events && res.events.length > 0) {
        setEvents(res.events);
      }
    } catch (err) {
      console.warn('IDS fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIds();
    const interval = setInterval(fetchIds, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleBlockIp = (ip: string) => {
    setBlockedIps(prev => new Set(prev).add(ip));
    setEvents(prev => prev.map(e => e.sourceIp === ip ? { ...e, status: 'Blocked' as const } : e));
  };

  const filteredEvents = events.filter(evt => {
    if (severityFilter !== 'ALL' && evt.severity !== severityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        evt.sourceIp.toLowerCase().includes(q) ||
        evt.signature.toLowerCase().includes(q) ||
        evt.targetEndpoint.toLowerCase().includes(q) ||
        evt.eventType.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex-1 w-full h-full flex flex-col overflow-hidden bg-[#000000] font-mono text-neutral-200">
      {/* Header Bar */}
      <div className="p-3 bg-[#0a0a0a] border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-none bg-emerald-500 animate-pulse" />
            <span className="text-neutral-400 font-bold uppercase">NETWORK IDS SENSOR:</span>
            <span className="text-white font-bold">SURICATA ONLINE</span>
          </div>

          <div className="h-4 w-[1px] bg-neutral-800 hidden sm:block" />

          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <span>INTERCEPTS: <strong className="text-white">{events.length}</strong></span>
            <span>BLOCKED: <strong className="text-rose-400">{blockedIps.size}</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter alerts..."
              className="w-full pl-8 pr-3 py-1 bg-[#000000] border border-neutral-800 text-neutral-200 placeholder-neutral-600 text-xs focus:outline-none focus:border-neutral-600"
            />
          </div>

          <button
            onClick={fetchIds}
            className="p-1.5 border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 transition-colors cursor-pointer"
            title="Poll Sensor"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Events Table */}
      <div className="flex-1 overflow-auto bg-[#000000]">
        {filteredEvents.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-600">
            {isLoading ? 'Polling network sensor signatures...' : 'No intrusion detection signatures recorded.'}
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#050505] border-b border-neutral-800 text-[10px] uppercase text-neutral-500 sticky top-0 z-10">
              <tr>
                <th className="p-2.5 font-bold">TIMESTAMP</th>
                <th className="p-2.5 font-bold">SEVERITY</th>
                <th className="p-2.5 font-bold">SOURCE IOC</th>
                <th className="p-2.5 font-bold">DEST / PORT</th>
                <th className="p-2.5 font-bold">SIGNATURE</th>
                <th className="p-2.5 font-bold">MITRE</th>
                <th className="p-2.5 font-bold">MITIGATION GUIDANCE</th>
                <th className="p-2.5 font-bold text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900 font-mono text-[11px]">
              {filteredEvents.map(evt => {
                const isBlocked = evt.status === 'Blocked' || blockedIps.has(evt.sourceIp);
                const isCrit = evt.severity === 'Critical';

                return (
                  <tr 
                    key={evt.id}
                    className={`transition-colors hover:bg-neutral-950 ${
                      isCrit ? 'bg-rose-950/10' : ''
                    }`}
                  >
                    <td className="p-2.5 text-neutral-400 whitespace-nowrap">
                      {evt.timestamp}
                    </td>

                    <td className="p-2.5 whitespace-nowrap">
                      <span className={`px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                        isCrit
                          ? 'bg-rose-950 text-rose-300 border border-rose-800/60'
                          : 'bg-amber-950 text-amber-300 border border-amber-800/60'
                      }`}>
                        {evt.severity}
                      </span>
                    </td>

                    <td className="p-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs">{evt.countryFlag || '🌐'}</span>
                        <button
                          onClick={() => onSelectIpForEnrichment(evt.sourceIp)}
                          className="text-white hover:text-cyan-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <span>{evt.sourceIp}</span>
                          <ExternalLink className="w-2.5 h-2.5 text-neutral-600" />
                        </button>
                      </div>
                    </td>

                    <td className="p-2.5 text-neutral-400 whitespace-nowrap">
                      {evt.targetEndpoint} (Port {evt.targetPort})
                    </td>

                    <td className="p-2.5 max-w-xs">
                      <div className="font-bold text-neutral-200 truncate" title={evt.signature}>
                        {evt.signature}
                      </div>
                      <div className="text-[10px] text-neutral-500 truncate mt-0.5">
                        {evt.eventType}
                      </div>
                    </td>

                    <td className="p-2.5 text-cyan-400 whitespace-nowrap font-bold">
                      {evt.mitreTechnique}
                    </td>

                    <td className="p-2.5 max-w-sm text-neutral-400 text-[10px] truncate" title={evt.mitigationTip}>
                      {evt.mitigationTip}
                    </td>

                    <td className="p-2.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectIpForEnrichment(evt.sourceIp)}
                          className="px-2 py-0.5 border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-[10px] cursor-pointer"
                        >
                          Enrich
                        </button>
                        <button
                          onClick={() => {
                            handleBlockIp(evt.sourceIp);
                            onSelectForContainment(evt.sourceIp, evt.targetPort, `${evt.signature} (${evt.mitreTechnique})`);
                          }}
                          className={`px-2 py-0.5 border text-[10px] font-bold cursor-pointer transition-colors ${
                            isBlocked
                              ? 'bg-neutral-900 border-neutral-800 text-neutral-500'
                              : 'bg-rose-950/60 hover:bg-rose-900/80 border-rose-800/80 text-rose-300'
                          }`}
                        >
                          {isBlocked ? 'Contained' : 'Contain'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
