'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';
import { Search, Upload, FileVideo, Image as ImageIcon, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { MediaSearchPanel } from './MediaSearchPanel';
import type { MediaSearchResult } from '@/lib/media-search';

interface EvidenceItem {
  id: string;
  type: 'image' | 'video';
  title: string;
  size: number;
  uploadedAt: Date;
  status: 'processing' | 'ready' | 'analyzed';
  caseId: string;
  url: string;
}

interface EvidenceLibraryProps {
  caseId?: string;
  onSelectEvidence?: (evidence: EvidenceItem) => void;
}

export function EvidenceLibrary({ caseId, onSelectEvidence }: EvidenceLibraryProps) {
  const [activeTab, setActiveTab] = useState('local');
  const [evidence, setEvidence] = useState<EvidenceItem[]>([
    {
      id: '1',
      type: 'video',
      title: 'Entrance Camera Feed - 2024-01-15 14:23',
      size: 2.4,
      uploadedAt: new Date('2024-01-15'),
      status: 'analyzed',
      caseId: caseId || 'case-001',
      url: '#',
    },
    {
      id: '2',
      type: 'image',
      title: 'Suspect ID - Angle 1',
      size: 0.8,
      uploadedAt: new Date('2024-01-15'),
      status: 'ready',
      caseId: caseId || 'case-001',
      url: '#',
    },
  ]);

  const handleMediaSelect = (media: MediaSearchResult) => {
    const newEvidence: EvidenceItem = {
      id: media.id,
      type: media.type,
      title: media.title,
      size: Math.random() * 10,
      uploadedAt: new Date(),
      status: 'ready',
      caseId: caseId || 'case-001',
      url: media.url,
    };
    setEvidence((prev) => [newEvidence, ...prev]);
    onSelectEvidence?.(newEvidence);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const newEvidence: EvidenceItem = {
        id: `local-${Date.now()}-${Math.random()}`,
        type: file.type.startsWith('video') ? 'video' : 'image',
        title: file.name,
        size: file.size / (1024 * 1024), // MB
        uploadedAt: new Date(),
        status: 'processing',
        caseId: caseId || 'case-001',
        url: URL.createObjectURL(file),
      };
      setEvidence((prev) => [newEvidence, ...prev]);
    });
  };

  const getStatusColor = (status: EvidenceItem['status']) => {
    switch (status) {
      case 'processing':
        return 'bg-var(--warning)/10 border-var(--warning)/25 text-var(--warning)';
      case 'ready':
        return 'bg-var(--accent)/10 border-var(--accent)/25 text-var(--accent)';
      case 'analyzed':
        return 'bg-var(--success)/10 border-var(--success)/25 text-var(--success)';
      default:
        return 'bg-var(--text-dim)/10 border-var(--text-dim)/25';
    }
  };

  const getStatusLabel = (status: EvidenceItem['status']) => {
    switch (status) {
      case 'processing':
        return '⏳ Processing';
      case 'ready':
        return '✓ Ready';
      case 'analyzed':
        return '✓✓ Analyzed';
      default:
        return '?';
    }
  };

  return (
    <div className="flex flex-col h-full gap-4 p-4 bg-var(--bg-surface) rounded-lg border border-var(--border)">
      <div>
        <h2 className="text-lg font-semibold text-var(--text-primary) mb-2">Evidence Library</h2>
        <p className="text-sm text-var(--text-secondary)">Upload or search for evidence to process</p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col"
      >
        <TabsList className="flex gap-2 p-0 border-b border-var(--border)">
          <TabsTrigger
            value="local"
            className="px-4 py-2 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-b-var(--accent) data-[state=active]:text-var(--accent) text-var(--text-secondary) hover:text-var(--text-primary) transition-colors"
          >
            <FileVideo className="w-4 h-4 mr-2 inline" /> Local Evidence
          </TabsTrigger>
          <TabsTrigger
            value="search"
            className="px-4 py-2 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-b-var(--accent) data-[state=active]:text-var(--accent) text-var(--text-secondary) hover:text-var(--text-primary) transition-colors"
          >
            <Search className="w-4 h-4 mr-2 inline" /> Search Database
          </TabsTrigger>
        </TabsList>

        {/* Local Evidence Tab */}
        <TabsContent value="local" className="flex-1 overflow-hidden">
          <div className="flex flex-col h-full gap-4">
            {/* Upload Area */}
            <label className="flex-shrink-0 flex flex-col items-center justify-center gap-3 p-6 rounded-lg border-2 border-dashed border-var(--border) hover:border-var(--accent)/50 transition-colors cursor-pointer bg-var(--bg-overlay) hover:bg-var(--bg-base)">
              <Upload className="w-6 h-6 text-var(--text-dim)" />
              <div className="text-center">
                <p className="text-sm font-medium text-var(--text-primary)">Drop files here or click to upload</p>
                <p className="text-xs text-var(--text-dim)">Video (MP4, MOV) or Images (JPG, PNG)</p>
              </div>
              <input
                type="file"
                multiple
                accept="video/*,image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {/* Evidence List */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {evidence.length === 0 ? (
                <div className="flex items-center justify-center h-full text-center">
                  <div>
                    <p className="text-var(--text-secondary) text-sm">No evidence uploaded yet</p>
                  </div>
                </div>
              ) : (
                evidence.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => onSelectEvidence?.(item)}
                    className="p-3 rounded-lg border border-var(--border) hover:border-var(--accent)/50 hover:bg-var(--bg-overlay) transition-all cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {item.type === 'video' ? (
                          <div className="w-8 h-8 rounded bg-var(--danger)/10 flex items-center justify-center">
                            <FileVideo className="w-4 h-4 text-var(--danger)" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded bg-var(--accent)/10 flex items-center justify-center">
                            <ImageIcon className="w-4 h-4 text-var(--accent)" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-var(--text-primary) line-clamp-1">
                          {item.title}
                        </p>
                        <p className="text-xs text-var(--text-dim)">
                          {item.size.toFixed(1)} MB • {item.uploadedAt.toLocaleDateString()}
                        </p>
                      </div>
                      <div
                        className={`flex-shrink-0 px-2.5 py-1 rounded text-xs font-medium border ${getStatusColor(
                          item.status
                        )}`}
                      >
                        {getStatusLabel(item.status)}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        {/* Search Tab */}
        <TabsContent value="search" className="flex-1 overflow-hidden">
          <MediaSearchPanel
            onSelectMedia={handleMediaSelect}
            initialQuery="crime scene evidence forensic"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
