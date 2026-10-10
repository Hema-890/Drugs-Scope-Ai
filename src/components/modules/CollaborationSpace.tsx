import React, { useState } from 'react';
import { Bookmark, FolderGit2, MessageSquare, Plus, Share2, Users } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  lead: string;
  members: number;
  focus: string;
  notesCount: number;
  lastActive: string;
}

export const CollaborationSpace: React.FC = () => {
  const [projects] = useState<Project[]>([
    {
      id: 'proj-01',
      title: 'Anticoagulant & Antiarrhythmic Pharmacogenomics Study',
      lead: 'Dr. Evelyn Reed (Lead PI)',
      members: 4,
      focus: 'CYP2C9 *2/*3 allele variants with S-Warfarin & Amiodarone clearance',
      notesCount: 14,
      lastActive: '2026-10-10'
    },
    {
      id: 'proj-02',
      title: 'P2Y12 Platelet Resistance in CYP2C19 Poor Metabolizers',
      lead: 'Dr. Marcus Vance (Cardiovascular Genomics)',
      members: 6,
      focus: 'Clopidogrel vs Prasugrel active thiol metabolite quantification with Omeprazole co-administration',
      notesCount: 22,
      lastActive: '2026-10-08'
    },
    {
      id: 'proj-03',
      title: 'Cryo-EM Allosteric Mapping of hERG Cardiac Channel',
      lead: 'Dr. Sarah Lin (Structural Biology)',
      members: 3,
      focus: 'Cation-pi aromatic trap residues Tyr652 & Phe656 with basic drug cocktails',
      notesCount: 9,
      lastActive: '2026-10-09'
    }
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-display font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-[#37D6E6]" />
            Research Collaboration Workspace
          </h1>
          <p className="text-xs text-[#A7B5C9] mt-1">
            Multi-institution research projects, team annotations, shared bookmarks, and role-based permissions
          </p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#37D6E6] text-[#070B14] font-semibold text-xs hover:bg-[#37D6E6]/90 transition-all shadow-md">
          <Plus className="w-4 h-4" /> Create Collaborative Project
        </button>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {projects.map((proj) => (
          <div
            key={proj.id}
            className="glass-panel p-6 rounded-xl border border-white/10 space-y-4 hover:border-[#37D6E6]/30 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <FolderGit2 className="w-5 h-5 text-[#9079F7]" />
                <h2 className="text-base font-display font-bold text-white">{proj.title}</h2>
              </div>
              <span className="text-[10px] font-mono text-[#64748B]">
                Active: {proj.lastActive}
              </span>
            </div>

            <p className="text-xs text-[#A7B5C9] leading-relaxed">
              <strong className="text-white">Investigation Scope:</strong> {proj.focus}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-2">
              <div className="flex items-center gap-4 text-[#A7B5C9]">
                <span>Lead: <strong className="text-white">{proj.lead}</strong></span>
                <span className="flex items-center gap-1 font-mono">
                  <Users className="w-3.5 h-3.5 text-[#32C8B7]" /> {proj.members} Collaborators
                </span>
                <span className="flex items-center gap-1 font-mono">
                  <MessageSquare className="w-3.5 h-3.5 text-[#37D6E6]" /> {proj.notesCount} Annotations
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 rounded-lg bg-[#172134] text-xs text-[#37D6E6] border border-[#37D6E6]/30 hover:bg-[#37D6E6]/10 transition-colors flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5" /> Share Access
                </button>
                <button className="px-3 py-1.5 rounded-lg bg-[#37D6E6] text-[#070B14] font-semibold text-xs hover:bg-[#37D6E6]/90 transition-colors">
                  Open Project Board →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
