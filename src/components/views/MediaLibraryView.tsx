import React, { useState, useRef } from 'react';
import {
  FolderOpen,
  Upload,
  Film,
  Music,
  Image as ImageIcon,
  Play,
  Trash2,
  Tag,
  Scissors,
  CheckCircle2,
  Clock,
  RotateCw,
} from 'lucide-react';
import type { MediaAsset } from '../../types';

interface MediaLibraryViewProps {
  media: MediaAsset[];
  onUploadMedia: (asset: MediaAsset) => void;
  onSendToEditor: (mediaId: string) => void;
}

export const MediaLibraryView: React.FC<MediaLibraryViewProps> = ({
  media,
  onUploadMedia,
  onSendToEditor,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'video' | 'audio' | 'image'>('all');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredMedia = media.filter(
    (m) => filterType === 'all' || m.mediaType === filterType
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const base64Data = reader.result as string;
        const res = await fetch('/api/media/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: file.name,
            mediaType: file.type.startsWith('audio')
              ? 'audio'
              : file.type.startsWith('image')
              ? 'image'
              : 'video',
            base64Data,
            tags: ['upload', 'raw_footage'],
          }),
        });

        const newAsset = await res.json();
        onUploadMedia(newAsset);
      } catch (err: any) {
        alert('Upload failed: ' + err.message);
      } finally {
        setUploading(false);
      }
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header & Upload Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-zinc-900 border border-zinc-800">
        <div>
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-cyan-400" /> Media Library & Raw Assets
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Store raw wheelhouse videos, engine room audio recordings, B-roll, and graphics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="video/*,audio/*,image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center gap-2 shadow-md shadow-cyan-950 cursor-pointer"
          >
            {uploading ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>Storing File...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Upload Media</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2">
        {(['all', 'video', 'audio', 'image'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize cursor-pointer transition-all ${
              filterType === type
                ? 'bg-zinc-800 text-cyan-300 border border-cyan-800/60'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {type}s ({type === 'all' ? media.length : media.filter((m) => m.mediaType === type).length})
          </button>
        ))}
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredMedia.map((asset) => (
          <div
            key={asset.id}
            className="rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all overflow-hidden flex flex-col justify-between"
          >
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center text-cyan-400">
                  {asset.mediaType === 'video' ? (
                    <Film className="w-4 h-4" />
                  ) : asset.mediaType === 'audio' ? (
                    <Music className="w-4 h-4" />
                  ) : (
                    <ImageIcon className="w-4 h-4" />
                  )}
                </span>
                <span className="text-[10px] font-mono text-zinc-500">
                  {(asset.size / 1024 / 1024).toFixed(1)} MB
                </span>
              </div>

              <h4 className="font-semibold text-xs text-zinc-200 truncate mt-2" title={asset.name}>
                {asset.name}
              </h4>

              <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {asset.duration}s
                </span>
                <span>•</span>
                <span>{asset.width ? `${asset.width}x${asset.height}` : 'Audio'}</span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 pt-1">
                {asset.tags.map((t, idx) => (
                  <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3 border-t border-zinc-800/80 bg-zinc-950/60 flex items-center justify-between text-xs">
              <a
                href={asset.url}
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:underline flex items-center gap-1 text-[11px]"
              >
                <Play className="w-3 h-3" /> Preview
              </a>
              <button
                onClick={() => onSendToEditor(asset.id)}
                className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-medium flex items-center gap-1 cursor-pointer"
              >
                <Scissors className="w-3 h-3 text-cyan-400" /> Send to Editor
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
