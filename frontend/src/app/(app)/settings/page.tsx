'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, User, Shield, Database, Cpu, Bell, Key, Users,
  ChevronRight, Save, Eye, EyeOff, Check, Zap, HardDrive,
  Globe, Lock, Monitor, Sliders,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn, initials } from '@/lib/utils';

type SettingsTab = 'profile' | 'security' | 'ai-models' | 'storage' | 'notifications' | 'users' | 'system';

const settingsTabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'ai-models', label: 'AI Models', icon: Cpu },
  { id: 'storage', label: 'Storage', icon: HardDrive },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'users', label: 'Users & Roles', icon: Users },
  { id: 'system', label: 'System', icon: Monitor },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const { user } = useAuthStore();

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar */}
      <div className="w-56 shrink-0 border-r border-border bg-[#070c19] flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1 h-4 rounded-full bg-accent" />
            <span className="text-xs font-semibold text-accent tracking-widest uppercase">Settings</span>
          </div>
          <h1 className="text-base font-bold">Configuration</h1>
        </div>
        <nav className="p-2 flex-1">
          {settingsTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn('nav-item w-full mb-0.5', activeTab === tab.id && 'nav-item-active')}
              >
                <Icon className={cn('w-4 h-4 shrink-0', activeTab === tab.id ? 'text-accent' : 'text-muted-foreground')} />
                <span className="text-sm">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8 max-w-3xl">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          {activeTab === 'profile' && <ProfileSettings user={user} />}
          {activeTab === 'security' && <SecuritySettings />}
          {activeTab === 'ai-models' && <AIModelSettings />}
          {activeTab === 'storage' && <StorageSettings />}
          {activeTab === 'notifications' && <NotificationSettings />}
          {activeTab === 'users' && <UsersSettings />}
          {activeTab === 'system' && <SystemSettings />}
        </motion.div>
      </div>
    </div>
  );
}

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-bold">{title}</h2>
      {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      <div className="mt-3 h-px bg-border" />
    </div>
  );
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-border/50">
      <div className="flex-1 mr-8">
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ defaultChecked = false }: { defaultChecked?: boolean }) {
  const [on, setOn] = useState(defaultChecked);
  return (
    <button
      onClick={() => setOn(!on)}
      className={cn('relative w-10 h-6 rounded-full transition-colors duration-200', on ? 'bg-accent' : 'bg-surface-raised border border-border')}
    >
      <motion.div
        animate={{ x: on ? 18 : 2 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow"
      />
    </button>
  );
}

function ProfileSettings({ user }: { user: any }) {
  return (
    <div>
      <SectionHeader title="Profile" description="Manage your account information and preferences." />
      <div className="flex items-center gap-5 mb-8 p-5 rounded-xl bg-surface border border-border">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1565C0] to-[#00B4D8] flex items-center justify-center shrink-0">
          <span className="text-xl font-bold text-white">{user ? initials(user.name) : 'AN'}</span>
        </div>
        <div>
          <p className="text-base font-semibold">{user?.name ?? 'Analyst'}</p>
          <p className="text-sm text-muted-foreground">{user?.email ?? 'analyst@panopticon.gov'}</p>
          <span className="badge-info text-2xs mt-1 inline-block capitalize">{user?.role ?? 'investigator'}</span>
        </div>
        <button className="ml-auto px-3 py-1.5 rounded-lg text-xs border border-border text-muted-foreground hover:text-foreground hover:border-accent/30 transition-colors">
          Change Avatar
        </button>
      </div>
      <div className="space-y-4">
        {[
          { label: 'Full Name', placeholder: user?.name ?? 'Your Name', type: 'text' },
          { label: 'Email', placeholder: user?.email ?? 'your@email.gov', type: 'email' },
          { label: 'Badge / ID', placeholder: user?.badge ?? 'DET-4821', type: 'text' },
          { label: 'Department', placeholder: user?.department ?? 'Homicide Division', type: 'text' },
        ].map((f) => (
          <div key={f.label} className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{f.label}</label>
            <input type={f.type} placeholder={f.placeholder} defaultValue={f.placeholder}
              className="w-full px-3 py-2.5 text-sm bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20" />
          </div>
        ))}
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:bg-accent-glow transition-colors mt-2">
          <Save className="w-4 h-4" /> Save Changes
        </button>
      </div>
    </div>
  );
}

function SecuritySettings() {
  const [showPass, setShowPass] = useState(false);
  return (
    <div>
      <SectionHeader title="Security" description="Manage authentication, sessions, and access controls." />
      <div className="space-y-4 mb-8">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Current Password</label>
          <div className="relative">
            <input type={showPass ? 'text' : 'password'} placeholder="••••••••"
              className="w-full px-3 py-2.5 pr-10 text-sm bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:border-accent/50" />
            <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">New Password</label>
          <input type="password" placeholder="••••••••"
            className="w-full px-3 py-2.5 text-sm bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:border-accent/50" />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:bg-accent-glow transition-colors">
          <Lock className="w-4 h-4" /> Update Password
        </button>
      </div>
      <div>
        <SettingRow label="Two-Factor Authentication" description="Require OTP on login">
          <Toggle defaultChecked={true} />
        </SettingRow>
        <SettingRow label="Session Timeout" description="Auto logout after inactivity">
          <select className="px-3 py-1.5 text-sm bg-surface border border-border rounded-lg text-foreground focus:outline-none cursor-pointer">
            {['30 minutes', '1 hour', '4 hours', '8 hours', 'Never'].map(o => (
              <option key={o} className="bg-[#0D1526]">{o}</option>
            ))}
          </select>
        </SettingRow>
        <SettingRow label="Audit Logging" description="Log all user actions">
          <Toggle defaultChecked={true} />
        </SettingRow>
        <SettingRow label="IP Whitelist" description="Restrict access by IP address">
          <Toggle defaultChecked={false} />
        </SettingRow>
      </div>
    </div>
  );
}

function AIModelSettings() {
  const models = [
    { id: 'yolo', name: 'YOLOv8', type: 'Detection', status: 'active', version: 'v8.2.0', gpu: '2.1 GB' },
    { id: 'bytetrack', name: 'ByteTrack', type: 'Tracking', status: 'active', version: 'v2.0', gpu: '0.8 GB' },
    { id: 'fastreid', name: 'FastReID', type: 'Re-ID', status: 'active', version: 'v1.3', gpu: '1.4 GB' },
    { id: 'sam2', name: 'SAM2', type: 'Segmentation', status: 'idle', version: 'v2.1', gpu: '3.2 GB' },
    { id: 'gemini', name: 'Gemini Pro', type: 'LLM', status: 'active', version: 'API', gpu: 'Cloud' },
    { id: 'bgem3', name: 'BGE-M3', type: 'Embeddings', status: 'active', version: 'v1.0', gpu: '0.9 GB' },
  ];
  return (
    <div>
      <SectionHeader title="AI Models" description="Configure computer vision, tracking, and language models." />
      <div className="space-y-2">
        {models.map((m) => (
          <div key={m.id} className="flex items-center gap-4 p-4 rounded-xl bg-surface border border-border">
            <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
              <Cpu className="w-4 h-4 text-accent" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{m.name}</span>
                <span className="badge-info text-2xs">{m.type}</span>
              </div>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-2xs font-mono text-muted-foreground">{m.version}</span>
                <span className="text-2xs text-muted-foreground">VRAM: {m.gpu}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={cn('w-2 h-2 rounded-full', m.status === 'active' ? 'bg-success' : 'bg-muted-foreground')} />
              <span className={cn('text-xs capitalize', m.status === 'active' ? 'text-success/80' : 'text-muted-foreground')}>
                {m.status}
              </span>
            </div>
            <Toggle defaultChecked={m.status === 'active'} />
          </div>
        ))}
      </div>
      <div className="mt-6 p-4 rounded-xl bg-surface border border-border space-y-3">
        <h3 className="text-sm font-semibold">Processing Configuration</h3>
        <SettingRow label="Detection Confidence Threshold" description="Minimum score to surface detections">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono w-8 text-right">65%</span>
            <input type="range" min="0" max="100" defaultValue="65" className="w-32 accent-blue-500" />
          </div>
        </SettingRow>
        <SettingRow label="ReID Similarity Threshold" description="Min score for cross-camera match">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono w-8 text-right">78%</span>
            <input type="range" min="0" max="100" defaultValue="78" className="w-32 accent-blue-500" />
          </div>
        </SettingRow>
        <SettingRow label="GPU Acceleration" description="Use CUDA for processing">
          <Toggle defaultChecked={true} />
        </SettingRow>
        <SettingRow label="Parallel Workers" description="Concurrent processing jobs">
          <select className="px-3 py-1.5 text-sm bg-surface border border-border rounded-lg text-foreground focus:outline-none cursor-pointer">
            {['1', '2', '4', '8'].map(o => (
              <option key={o} className="bg-[#0D1526]">{o}</option>
            ))}
          </select>
        </SettingRow>
      </div>
    </div>
  );
}

function StorageSettings() {
  return (
    <div>
      <SectionHeader title="Storage" description="Configure evidence storage backend and retention policies." />
      <div className="space-y-4 mb-6">
        <div className="p-4 rounded-xl bg-surface border border-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold">Storage Usage</span>
            <span className="text-xs font-mono text-muted-foreground">4.8 TB / 10 TB</span>
          </div>
          <div className="confidence-bar h-2">
            <motion.div className="confidence-fill bg-accent h-2" initial={{ width: 0 }} animate={{ width: '48%' }} transition={{ duration: 0.8 }} />
          </div>
          <div className="flex justify-between mt-2 text-2xs text-muted-foreground">
            <span>Video: 3.2 TB</span><span>Images: 0.9 TB</span><span>Other: 0.7 TB</span>
          </div>
        </div>
      </div>
      <SettingRow label="Storage Backend" description="Local or cloud object storage">
        <select className="px-3 py-1.5 text-sm bg-surface border border-border rounded-lg text-foreground focus:outline-none cursor-pointer">
          {['Local Filesystem', 'AWS S3', 'MinIO', 'Azure Blob'].map(o => (
            <option key={o} className="bg-[#0D1526]">{o}</option>
          ))}
        </select>
      </SettingRow>
      <SettingRow label="Auto-Compress Evidence" description="Transcode uploads to H.264">
        <Toggle defaultChecked={true} />
      </SettingRow>
      <SettingRow label="Retention Period" description="Auto-archive after">
        <select className="px-3 py-1.5 text-sm bg-surface border border-border rounded-lg text-foreground focus:outline-none cursor-pointer">
          {['30 days', '90 days', '1 year', '5 years', 'Never'].map(o => (
            <option key={o} className="bg-[#0D1526]">{o}</option>
          ))}
        </select>
      </SettingRow>
      <SettingRow label="Encryption at Rest" description="AES-256 encryption">
        <Toggle defaultChecked={true} />
      </SettingRow>
    </div>
  );
}

function NotificationSettings() {
  return (
    <div>
      <SectionHeader title="Notifications" description="Configure alert channels and thresholds." />
      {[
        { label: 'Suspect Match Alerts', description: 'When ReID matches a tracked suspect', checked: true },
        { label: 'Processing Complete', description: 'When AI finishes analyzing evidence', checked: true },
        { label: 'Critical Case Updates', description: 'Status changes on critical cases', checked: true },
        { label: 'System Alerts', description: 'Server health and errors', checked: false },
        { label: 'New Evidence Uploaded', description: 'When colleagues upload to shared cases', checked: true },
        { label: 'Report Generated', description: 'When AI reports are ready', checked: true },
        { label: 'Email Digest', description: 'Daily summary email', checked: false },
      ].map((n) => (
        <SettingRow key={n.label} label={n.label} description={n.description}>
          <Toggle defaultChecked={n.checked} />
        </SettingRow>
      ))}
    </div>
  );
}

function UsersSettings() {
  const users = [
    { name: 'Det. Sarah Kim', email: 'skim@panopticon.gov', role: 'investigator', status: 'active', cases: 8 },
    { name: 'Det. Marcus Webb', email: 'mwebb@panopticon.gov', role: 'investigator', status: 'active', cases: 5 },
    { name: 'Sgt. Diana Torres', email: 'dtorres@panopticon.gov', role: 'analyst', status: 'active', cases: 3 },
    { name: 'Off. Chris Patel', email: 'cpatel@panopticon.gov', role: 'viewer', status: 'active', cases: 1 },
    { name: 'Admin', email: 'admin@panopticon.gov', role: 'admin', status: 'active', cases: 0 },
  ];
  return (
    <div>
      <SectionHeader title="Users & Roles" description="Manage investigator accounts and permissions." />
      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-surface">
              {['User', 'Role', 'Cases', 'Status', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-2xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.email} className="data-row">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1565C0] to-[#00B4D8] flex items-center justify-center">
                      <span className="text-xs font-bold text-white">{initials(u.name)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{u.name}</p>
                      <p className="text-2xs text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3"><span className="badge-info text-2xs capitalize">{u.role}</span></td>
                <td className="px-4 py-3 text-sm tabular-nums">{u.cases}</td>
                <td className="px-4 py-3"><span className="badge-active text-2xs">{u.status}</span></td>
                <td className="px-4 py-3">
                  <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SystemSettings() {
  return (
    <div>
      <SectionHeader title="System" description="Platform configuration, integrations, and diagnostics." />
      <SettingRow label="Platform Version" description="Current PANOPTICON build">
        <span className="text-xs font-mono text-muted-foreground">v1.0.0-beta</span>
      </SettingRow>
      <SettingRow label="API Base URL" description="Backend service endpoint">
        <span className="text-xs font-mono text-muted-foreground">http://localhost:8000</span>
      </SettingRow>
      <SettingRow label="Vector DB" description="ChromaDB connection">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-success" />
          <span className="text-xs text-success/80">Connected</span>
        </div>
      </SettingRow>
      <SettingRow label="Redis Cache" description="Cache layer connection">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-success" />
          <span className="text-xs text-success/80">Connected</span>
        </div>
      </SettingRow>
      <SettingRow label="Debug Mode" description="Verbose logging and diagnostics">
        <Toggle defaultChecked={false} />
      </SettingRow>
      <SettingRow label="Telemetry" description="Anonymous usage statistics">
        <Toggle defaultChecked={false} />
      </SettingRow>
      <div className="mt-8 p-4 rounded-xl bg-danger/5 border border-danger/20">
        <h3 className="text-sm font-semibold text-danger mb-1">Danger Zone</h3>
        <p className="text-xs text-muted-foreground mb-3">These actions are irreversible. Proceed with extreme caution.</p>
        <div className="flex gap-3">
          <button className="px-3 py-1.5 rounded-lg text-xs border border-danger/30 text-danger hover:bg-danger/10 transition-colors">
            Flush Cache
          </button>
          <button className="px-3 py-1.5 rounded-lg text-xs border border-danger/30 text-danger hover:bg-danger/10 transition-colors">
            Reset AI Models
          </button>
        </div>
      </div>
    </div>
  );
}
