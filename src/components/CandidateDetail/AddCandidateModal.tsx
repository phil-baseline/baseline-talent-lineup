import { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Textarea } from '../common/Textarea';
import { Tag } from '../common/Tag';
import { LinkIcon } from '../common/LinkIcon';
import { parseResume, type ParsedResume } from '../../lib/resumeParser';
import { isFilesystemMode } from '../../lib/fileStorage';
import { sourceOptions, createLink } from '../../lib/linkUtils';
import type { Source, CandidateLink } from '../../store/types';

interface AddCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddCandidateModal({ isOpen, onClose }: AddCandidateModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [links, setLinks] = useState<CandidateLink[]>([]);
  const [source, setSource] = useState<Source>('linkedin');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [resumeText, setResumeText] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up object URL when component unmounts or file changes
  useEffect(() => {
    return () => {
      if (documentUrl) {
        URL.revokeObjectURL(documentUrl);
      }
    };
  }, [documentUrl]);
  const createCandidate = useStore((state) => state.createCandidate);
  const settings = useStore((state) => state.settings);
  const addCustomTag = useStore((state) => state.addCustomTag);

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setTitle('');
    setCompany('');
    setLinks([]);
    setSource('linkedin');
    setNotes('');
    setTags([]);
    setNewTag('');
    setNewLinkUrl('');
    setResumeText('');
    setResumeFile(null);
    setParseError(null);
    if (documentUrl) {
      URL.revokeObjectURL(documentUrl);
      setDocumentUrl(null);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleParsedResume = (parsed: ParsedResume) => {
    // Always update from new resume (replacing previous values)
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
    const isValidType = file.type.includes('pdf') ||
      file.type.includes('word') ||
      file.type.includes('document') ||
      fileName.endsWith('.pdf') ||
      fileName.endsWith('.docx') ||
      fileName.endsWith('.doc');

    if (!isValidType) {
      setParseError('Please upload a PDF or DOCX file');
      return;
    }

    setIsParsing(true);
    setParseError(null);
    setResumeFile(file);

    // Clean up previous URL
    if (documentUrl) {
      URL.revokeObjectURL(documentUrl);
    }

    // Create object URL for document preview (works for PDFs)
    const url = URL.createObjectURL(file);
    setDocumentUrl(url);

    try {
      const parsed = await parseResume(file);
      handleParsedResume(parsed);
    } catch (err) {
      console.error('Failed to parse resume:', err);
      setParseError('Failed to parse resume. Please enter details manually.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await createCandidate({
      name: name.trim(),
      email: email || undefined,
      phone: phone || undefined,
      title: title || undefined,
      company: company || undefined,
      links,
      source,
      notes,
      tags,
      resumeData: resumeText || undefined,
      resumeFile: resumeFile || undefined,
    });

    handleClose();
  };

  const handleAddTag = () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      addCustomTag(trimmedTag);
      setNewTag('');
    }
  };

  const handleRemoveLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleAddLink = () => {
    const url = newLinkUrl.trim();
    if (!url) return;

    const newLink = createLink(url);
    if (!links.some(link => link.url.toLowerCase() === newLink.url.toLowerCase())) {
      setLinks([...links, newLink]);
    }
    setNewLinkUrl('');
  };

  const suggestedTags = settings.customTags.filter(
    (t) => !tags.includes(t) && t.toLowerCase().includes(newTag.toLowerCase())
  );

  const isPdf = resumeFile?.name.toLowerCase().endsWith('.pdf');

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Candidate" size={documentUrl ? 'wide' : 'default'}>
      <div className={documentUrl ? 'flex gap-6' : ''}>
        {/* Form Section */}
        <form onSubmit={handleSubmit} className={`space-y-4 ${documentUrl ? 'w-1/2 max-h-[70vh] overflow-y-auto pr-2' : 'max-h-[70vh] overflow-y-auto pr-2'}`}>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              border-2 border-dashed rounded-lg p-4 text-center cursor-pointer
              transition-all duration-200
              ${isDragging
                ? 'border-sage bg-sage/5'
                : 'border-brown/30 hover:border-sage hover:bg-cream/50'
              }
            `}
          >
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

            {isParsing ? (
              <div className="flex flex-col items-center py-2">
                <div className="w-6 h-6 border-2 border-sage border-t-transparent rounded-full animate-spin mb-1" />
                <p className="text-sm text-stone">Parsing resume...</p>
              </div>
            ) : resumeText ? (
              <div className="flex flex-col items-center py-1">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-sage"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="font-headline text-sm text-sage">Resume uploaded</span>
                  <span className="text-xs text-stone/70">· Click to replace</span>
                </div>
                {isFilesystemMode() && (
                  <span className="text-xs text-sage/60 mt-1">File will be saved to your folder</span>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center py-1">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-sage/50"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span className="font-headline text-sm text-stone">Drop a resume here</span>
                  <span className="text-xs text-stone/70">· PDF or DOCX</span>
                </div>
                {isFilesystemMode() && (
                  <span className="text-xs text-sage/60 mt-1">File will be saved to your folder</span>
                )}
              </div>
            )}
          </div>

          {parseError && (
            <p className="text-sm text-red-500">{parseError}</p>
          )}

          <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full name"
          required
        />

        <div className="grid grid-cols-2 gap-3">
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
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
          />
          <Input
            label="Phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 234 567 8900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone mb-1.5 tracking-wide">
            Links
          </label>
          {links.length > 0 && (
            <div className="space-y-1.5 mb-2">
              {links.map((link, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <span className="text-sage"><LinkIcon type={link.type} size="sm" /></span>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sage hover:text-moss truncate flex-1"
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
              placeholder="linkedin.com/in/... or github.com/..."
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
              <Tag key={tag} onRemove={() => setTags(tags.filter((t) => t !== tag))}>
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
                    type="button"
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
          rows={3}
          placeholder="Initial notes about this candidate..."
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!name.trim()}>
            Add Candidate
          </Button>
        </div>
        </form>

        {/* Document Preview Section */}
        {documentUrl && (
          <div className="w-1/2 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-headline text-sm font-medium text-deep-brown">
                {resumeFile?.name}
              </h3>
            </div>
            <div className="flex-1 border border-brown/20 rounded-lg overflow-hidden bg-white min-h-[500px]">
              {isPdf ? (
                <iframe
                  src={documentUrl}
                  className="w-full h-full min-h-[500px]"
                  title="Resume preview"
                />
              ) : (
                // For DOCX, show the extracted text since browsers can't render DOCX
                <div className="p-4 h-full overflow-y-auto">
                  <p className="text-xs text-stone/60 mb-3 italic">
                    DOCX preview shows extracted text. The original file will be saved.
                  </p>
                  <pre className="text-sm text-deep-brown whitespace-pre-wrap font-mono leading-relaxed">
                    {resumeText}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
