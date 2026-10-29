import { useState } from 'react';
import type { CandidateLink } from '../../store/types';
import { createLink } from '../../lib/linkUtils';
import { Input } from '../common/Input';

interface LinksEditorProps {
  links: CandidateLink[];
  onChange: (links: CandidateLink[]) => void;
}

export function LinksEditor({ links, onChange }: LinksEditorProps) {
  const [url, setUrl] = useState('');

  const add = () => {
    const link = createLink(url.trim());
    if (!link) return;
    if (!links.some((l) => l.url.toLowerCase() === link.url.toLowerCase())) {
      onChange([...links, link]);
    }
    setUrl('');
  };

  return (
    <div>
      {links.length > 0 && (
        <ul className="mb-2">
          {links.map((link, index) => (
            <li key={link.url} className="flex items-baseline gap-4 min-w-0">
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate text-ink underline hover:text-accent py-1"
              >
                {link.url.replace(/^https?:\/\/(www\.)?/, '')}
              </a>
              <button
                type="button"
                onClick={() => onChange(links.filter((_, i) => i !== index))}
                className="ml-auto shrink-0 text-sm text-muted hover:text-ink hover:underline py-1"
                aria-label={`Remove ${link.url}`}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex items-end gap-4">
        <Input
          label="Add a link"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="linkedin.com/in/name"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
        />
        <button
          type="button"
          onClick={add}
          disabled={!url.trim()}
          className="min-h-11 shrink-0 text-sm font-semibold text-accent hover:underline disabled:text-muted disabled:no-underline"
        >
          Add
        </button>
      </div>
    </div>
  );
}
