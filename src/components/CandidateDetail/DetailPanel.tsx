import { useState } from 'react';
import { useStore } from '../../store';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Textarea } from '../common/Textarea';
import { Select } from '../common/Select';
import { CloseButton } from '../common/Modal';
import { LinksEditor } from './LinksEditor';
import { parseTags } from './tags';
import { sourceOptions } from '../../lib/linkUtils';
import { pipelineStages, stageLabels } from '../../lib/stages';
import type { Stage, Source, CandidateLink } from '../../store/types';

const stageOptions = [...pipelineStages, 'passed' as Stage].map((s) => ({ value: s, label: stageLabels[s] }));

// Mounted with key={candidateId}, so local form state starts fresh for each candidate.
export function DetailPanel() {
  const candidate = useStore((state) => state.candidates.find((c) => c.id === state.selectedCandidateId));
  const updateCandidate = useStore((state) => state.updateCandidate);
  const moveCandidate = useStore((state) => state.moveCandidate);
  const deleteCandidate = useStore((state) => state.deleteCandidate);
  const selectCandidate = useStore((state) => state.selectCandidate);
  const addCustomTag = useStore((state) => state.addCustomTag);

  const [name, setName] = useState(candidate?.name ?? '');
  const [email, setEmail] = useState(candidate?.email ?? '');
  const [phone, setPhone] = useState(candidate?.phone ?? '');
  const [title, setTitle] = useState(candidate?.title ?? '');
  const [company, setCompany] = useState(candidate?.company ?? '');
  const [links, setLinks] = useState<CandidateLink[]>(candidate?.links ?? []);
  const [source, setSource] = useState<Source>(candidate?.source ?? 'linkedin');
  const [notes, setNotes] = useState(candidate?.notes ?? '');
  const [tags, setTags] = useState((candidate?.tags ?? []).join(', '));
  const [saved, setSaved] = useState(false);

  if (!candidate) return null;

  const close = () => selectCandidate(null);

  const handleSave = async () => {
    const tagList = parseTags(tags);
    await updateCandidate(candidate.id, {
      name: name.trim() || candidate.name,
      email: email || undefined,
      phone: phone || undefined,
      title: title || undefined,
      company: company || undefined,
      links,
      source,
      notes,
      tags: tagList,
    });
    for (const tag of tagList) await addCustomTag(tag);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDelete = async () => {
    if (confirm(`Delete ${candidate.name}? This cannot be undone.`)) {
      await deleteCandidate(candidate.id);
    }
  };

  const role = candidate.title && candidate.company ? `${candidate.title} at ${candidate.company}` : candidate.title || candidate.company;

  return (
    <aside
      aria-labelledby="detail-name"
      className="fixed inset-0 z-30 bg-paper overflow-y-auto md:static md:z-auto md:w-[28rem] md:shrink-0 md:pl-12 md:pr-6"
    >
      <div className="px-4 md:px-0 pt-4 md:pt-0 pb-10">
        <div className="flex items-start justify-between gap-4">
          <h2 id="detail-name" className="font-serif text-[1.75rem] leading-tight font-semibold pt-1">
            {candidate.name}
          </h2>
          <CloseButton onClick={close} label="Close candidate" />
        </div>
        {role && <p className="text-muted mt-1">{role}</p>}

        <div className="mt-6 max-w-56">
          <Select
            label="Stage"
            value={candidate.stage}
            onChange={(e) => moveCandidate(candidate.id, e.target.value as Stage)}
            options={stageOptions}
          />
        </div>

        <form
          className="mt-10 space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Input label="Company" value={company} onChange={(e) => setCompany(e.target.value)} />
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input label="Phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <LinksEditor links={links} onChange={setLinks} />
          <Select
            label="Source"
            value={source}
            onChange={(e) => setSource(e.target.value as Source)}
            options={sourceOptions}
          />
          <Input label="Tags" hint="Separate with commas." value={tags} onChange={(e) => setTags(e.target.value)} />
          <Textarea label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={6} />

          {candidate.resumeData && (
            <details>
              <summary className="min-h-11 flex items-center cursor-pointer font-semibold text-accent hover:underline">
                Resume text
              </summary>
              <p className="mt-2 text-sm text-ink whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
                {candidate.resumeData}
              </p>
            </details>
          )}

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2">
            <Button type="submit">Save changes</Button>
            <span role="status" className="text-sm text-muted">
              {saved ? 'Saved' : ''}
            </span>
          </div>
        </form>

        <div className="mt-8 flex flex-wrap gap-x-6">
          {candidate.stage !== 'passed' ? (
            <Button
              variant="quiet"
              onClick={() => {
                moveCandidate(candidate.id, 'passed');
                close();
              }}
            >
              Pass on candidate
            </Button>
          ) : (
            <Button variant="quiet" onClick={() => moveCandidate(candidate.id, 'sourced')}>
              Restore to Sourced
            </Button>
          )}
          <Button variant="quiet" onClick={handleDelete}>
            Delete candidate
          </Button>
        </div>
      </div>
    </aside>
  );
}
