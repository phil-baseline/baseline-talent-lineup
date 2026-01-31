import { useState, useEffect } from 'react';
import { useStore } from '../../store';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Textarea } from '../common/Textarea';
import { Select } from '../common/Select';
import { Tag } from '../common/Tag';
import { LinkIcon } from '../common/LinkIcon';
import { sourceOptions, createLink } from '../../lib/linkUtils';
import type { Stage, Source, CandidateLink } from '../../store/types';

const stageOptions = [
  { value: 'sourced', label: 'Sourced' },
  { value: 'interviewing', label: 'Interviewing' },
  { value: 'feedback', label: 'Awaiting Feedback' },
  { value: 'offer', label: 'Offer' },
  { value: 'hired', label: 'Hired' },
  { value: 'passed', label: 'Passed' },
];

type SaveStatus = 'idle' | 'saved';

export function DetailPanel() {
  const isMobile = useIsMobile();
  const selectedCandidateId = useStore((state) => state.selectedCandidateId);
  const candidates = useStore((state) => state.candidates);
  const updateCandidate = useStore((state) => state.updateCandidate);
  const deleteCandidate = useStore((state) => state.deleteCandidate);
  const selectCandidate = useStore((state) => state.selectCandidate);
  const settings = useStore((state) => state.settings);
  const addCustomTag = useStore((state) => state.addCustomTag);

  const candidate = candidates.find((c) => c.id === selectedCandidateId);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [links, setLinks] = useState<CandidateLink[]>([]);
  const [stage, setStage] = useState<Stage>('sourced');
  const [source, setSource] = useState<Source>('linkedin');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  useEffect(() => {
    if (candidate) {
      setName(candidate.name);
      setEmail(candidate.email || '');
      setPhone(candidate.phone || '');
      setTitle(candidate.title || '');
      setCompany(candidate.company || '');
      setLinks(candidate.links || []);
      setStage(candidate.stage);
      setSource(candidate.source);
      setNotes(candidate.notes);
      setTags(candidate.tags);
    }
  }, [candidate]);

  if (!candidate) return null;

  const handleSave = async () => {
    await updateCandidate(candidate.id, {
      name,
      email: email || undefined,
      phone: phone || undefined,
      title: title || undefined,
      company: company || undefined,
      links,
      stage,
      source,
      notes,
      tags,
    });
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const handleDelete = async () => {
    if (confirm(`Delete ${candidate.name}? This cannot be undone.`)) {
      await deleteCandidate(candidate.id);
    }
  };

  const handleAddTag = () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      const updatedTags = [...tags, trimmedTag];
      setTags(updatedTags);
      addCustomTag(trimmedTag);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleRemoveLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleAddLink = () => {
    const url = newLinkUrl.trim();
    if (!url) return;

    const newLink = createLink(url);
    if (!newLink) return; // Invalid URL (javascript:, data:, etc.)
    if (!links.some(link => link.url.toLowerCase() === newLink.url.toLowerCase())) {
      setLinks([...links, newLink]);
    }
    setNewLinkUrl('');
  };

  const suggestedTags = settings.customTags.filter(
    (t) => !tags.includes(t) && t.toLowerCase().includes(newTag.toLowerCase())
  );

  return (
    <div className={`fixed ${isMobile ? 'inset-0' : 'inset-y-0 right-0 w-96'} bg-surface border-l border-brown/10 shadow-xl flex flex-col animate-in ${isMobile ? 'slide-in-from-bottom' : 'slide-in-from-right'} duration-250 z-50`}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-brown/10">
        <h2 className="font-headline text-xl font-semibold text-deep-brown">
          Candidate Details
        </h2>
        <button
          onClick={() => selectCandidate(null)}
          className="p-1 text-stone hover:text-deep-brown transition-colors rounded-full hover:bg-cream"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Senior Engineer"
        />

        <Input
          label="Company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="e.g. Acme Inc"
        />

        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          label="Phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <div>
          <label className="block text-sm font-medium text-stone mb-1.5 tracking-wide">
            Links
          </label>
          {links.length > 0 && (
            <div className="space-y-2 mb-2">
              {links.map((link, index) => (
                <div key={index} className="flex items-center gap-2 bg-cream/50 rounded-lg px-3 py-2">
                  <span className="text-sage"><LinkIcon type={link.type} /></span>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-sage hover:text-moss truncate flex-1"
                  >
                    {link.url.replace(/^https?:\/\/(www\.)?/, '')}
                  </a>
                  <button
                    type="button"
                    onClick={() => handleRemoveLink(index)}
                    className="text-stone hover:text-red-500 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <Input
              value={newLinkUrl}
              onChange={(e) => setNewLinkUrl(e.target.value)}
              placeholder="Add a link..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddLink();
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddLink}
              disabled={!newLinkUrl.trim()}
              className="px-3 py-2 text-sm text-sage hover:text-moss disabled:text-stone/40 transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        <Select
          label="Stage"
          value={stage}
          onChange={(e) => setStage(e.target.value as Stage)}
          options={stageOptions}
        />

        <Select
          label="Source"
          value={source}
          onChange={(e) => setSource(e.target.value as Source)}
          options={sourceOptions}
        />

        <div>
          <label className="block text-sm font-medium text-stone mb-1.5 tracking-wide">
            Tags
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {tags.map((tag) => (
              <Tag key={tag} onRemove={() => handleRemoveTag(tag)}>
                {tag}
              </Tag>
            ))}
          </div>
          <div className="relative">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add a tag..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
            />
            {newTag && suggestedTags.length > 0 && (
              <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-surface border border-brown/20 rounded-lg shadow-lg py-1">
                {suggestedTags.slice(0, 5).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      if (!tags.includes(tag)) {
                        setTags([...tags, tag]);
                      }
                      setNewTag('');
                    }}
                    className="w-full text-left px-3 py-1.5 text-sm text-deep-brown hover:bg-cream transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <Textarea
          label="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={6}
          placeholder="Add notes about this candidate..."
        />

        {candidate.resumeData && (
          <div>
            <label className="block text-sm font-medium text-stone mb-1.5 tracking-wide">
              Resume
            </label>
            <details className="bg-cream/50 rounded-lg border border-brown/10">
              <summary className="px-3 py-2 cursor-pointer text-sm text-sage hover:text-moss transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                View parsed resume text
              </summary>
              <div className="px-3 py-2 border-t border-brown/10 max-h-48 overflow-y-auto">
                <pre className="text-xs text-stone whitespace-pre-wrap font-mono leading-relaxed">
                  {candidate.resumeData}
                </pre>
              </div>
            </details>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-brown/10 space-y-3">
        <Button onClick={handleSave} className="w-full">
          {saveStatus === 'saved' ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5 text-green-600 animate-[checkmark_0.4s_ease-in-out]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Saved
            </span>
          ) : (
            'Save Changes'
          )}
        </Button>
        {stage !== 'passed' ? (
          <Button
            variant="ghost"
            onClick={() => {
              setStage('passed');
              updateCandidate(candidate.id, { stage: 'passed' });
              selectCandidate(null);
            }}
            className="w-full text-stone hover:text-brown hover:bg-cream"
          >
            Pass on Candidate
          </Button>
        ) : (
          <Button
            variant="ghost"
            onClick={() => {
              setStage('sourced');
              updateCandidate(candidate.id, { stage: 'sourced' });
            }}
            className="w-full text-sage hover:text-moss hover:bg-sage/10"
          >
            Restore to Pipeline
          </Button>
        )}
        <Button variant="ghost" onClick={handleDelete} className="w-full text-red-500 hover:bg-red-50">
          Delete Candidate
        </Button>
      </div>
    </div>
  );
}
