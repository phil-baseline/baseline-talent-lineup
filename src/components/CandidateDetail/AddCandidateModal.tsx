import { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Textarea } from '../common/Textarea';
import { LinksEditor } from './LinksEditor';
import { parseTags } from './tags';
import { parseResume, type ParsedResume } from '../../lib/resumeParser';
import { isFilesystemMode } from '../../lib/fileStorage';
import { sourceOptions } from '../../lib/linkUtils';
import type { Source, CandidateLink } from '../../store/types';

export function AddCandidateModal() {
  const isOpen = useStore((state) => state.isAddCandidateOpen);
  const setOpen = useStore((state) => state.setAddCandidateOpen);
  const createCandidate = useStore((state) => state.createCandidate);
  const addCustomTag = useStore((state) => state.addCustomTag);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [links, setLinks] = useState<CandidateLink[]>([]);
  const [source, setSource] = useState<Source>('linkedin');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [resumeText, setResumeText] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (documentUrl) URL.revokeObjectURL(documentUrl);
    };
  }, [documentUrl]);

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setTitle('');
    setCompany('');
    setLinks([]);
    setSource('linkedin');
    setNotes('');
    setTags('');
    setResumeText('');
    setResumeFile(null);
    setParseError(null);
    setDocumentUrl(null);
  };

  const handleClose = () => {
    resetForm();
    setOpen(false);
  };

  const handleParsedResume = (parsed: ParsedResume) => {
    if (parsed.name) setName(parsed.name);
    if (parsed.email) setEmail(parsed.email);
    if (parsed.phone) setPhone(parsed.phone);
    if (parsed.title) setTitle(parsed.title);
    if (parsed.company) setCompany(parsed.company);
    if (parsed.links.length > 0) setLinks(parsed.links);
    setResumeText(parsed.rawText);
    setParseError(null);
  };

  const handleFileUpload = async (file: File) => {
    const fileName = file.name.toLowerCase();
    const isValidType =
      file.type.includes('pdf') ||
      file.type.includes('word') ||
      file.type.includes('document') ||
      fileName.endsWith('.pdf') ||
      fileName.endsWith('.docx') ||
      fileName.endsWith('.doc');

    if (!isValidType) {
      setParseError('That file type is not supported. Use a PDF or DOCX.');
      return;
    }

    setIsParsing(true);
    setParseError(null);
    setResumeFile(file);
    setDocumentUrl(URL.createObjectURL(file));

    try {
      handleParsedResume(await parseResume(file));
    } catch (err) {
      console.error('Failed to parse resume:', err);
      setParseError('Could not read that resume. Fill in the details by hand.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const tagList = parseTags(tags);
    await createCandidate({
      name: name.trim(),
      email: email || undefined,
      phone: phone || undefined,
      title: title || undefined,
      company: company || undefined,
      links,
      source,
      notes,
      tags: tagList,
      resumeData: resumeText || undefined,
      resumeFile: resumeFile || undefined,
    });
    for (const tag of tagList) await addCustomTag(tag);
    handleClose();
  };

  const isPdf = resumeFile?.name.toLowerCase().endsWith('.pdf');

  let resumeStatus = 'PDF or DOCX. Lineup reads it in your browser and fills in what it can.';
  if (isDragging) resumeStatus = 'Drop the file to read it.';
  else if (isParsing) resumeStatus = 'Reading the resume.';
  else if (resumeFile) resumeStatus = `${resumeFile.name} attached.`;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add candidate" size={documentUrl ? 'wide' : 'default'}>
      <div className={documentUrl ? 'lg:grid lg:grid-cols-2 lg:gap-12' : ''}>
        <form
          onSubmit={handleSubmit}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFileUpload(file);
          }}
          className="space-y-6"
        >
          <div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="min-h-11 font-semibold text-accent hover:underline"
            >
              {resumeFile ? 'Replace the resume' : 'Upload a resume'}
            </button>
            <p className={`text-sm ${isDragging ? 'text-accent font-semibold' : 'text-muted'}`} aria-live="polite">
              {resumeStatus}
              {!resumeFile && !isDragging && !isParsing && ' You can also drop it on this form.'}
              {resumeFile && isFilesystemMode() && ' The file will be saved to your folder.'}
            </p>
            {parseError && <p className="text-sm text-ink font-semibold mt-1">{parseError}</p>}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
              className="hidden"
            />
          </div>

          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Input label="Company" value={company} onChange={(e) => setCompany(e.target.value)} />
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input label="Phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <LinksEditor links={links} onChange={setLinks} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Select
              label="Source"
              value={source}
              onChange={(e) => setSource(e.target.value as Source)}
              options={sourceOptions}
            />
            <Input label="Tags" hint="Separate with commas." value={tags} onChange={(e) => setTags(e.target.value)} />
          </div>
          <Textarea label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />

          <div className="flex items-center gap-6 pt-2">
            <Button type="submit">
              Add candidate
            </Button>
            <Button variant="quiet" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        </form>

        {documentUrl && (
          <div className="mt-12 lg:mt-0 flex flex-col">
            <h3 className="font-semibold mb-2 truncate">{resumeFile?.name}</h3>
            {isPdf ? (
              <iframe src={documentUrl} className="w-full flex-1 min-h-[600px]" title="Resume preview" />
            ) : (
              <>
                <p className="text-sm text-muted mb-3">Text taken from the file. The original is kept.</p>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{resumeText}</p>
              </>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
