import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import type { CandidateLink } from '../store/types';

// Use CDN for worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export interface ParsedResume {
  name?: string;
  email?: string;
  phone?: string;
  title?: string;
  company?: string;
  links: CandidateLink[];
  rawText: string;
}

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_REGEX = /(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/g;
const LINKEDIN_REGEX = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?/gi;
const GITHUB_REGEX = /(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_-]+\/?/gi;
const URL_REGEX = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi;

export async function extractTextFromPdf(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();

      // Track Y position to detect line breaks
      let lastY: number | null = null;
      let pageText = '';

      for (const item of textContent.items) {
        if (!('str' in item)) continue;

        const text = item.str;
        // Check if this item has transform data (position)
        if ('transform' in item && Array.isArray(item.transform)) {
          const y = item.transform[5]; // Y position is at index 5

          // If Y position changed significantly, add a newline
          if (lastY !== null && Math.abs(y - lastY) > 5) {
            pageText += '\n';
          } else if (pageText.length > 0 && !pageText.endsWith(' ') && !pageText.endsWith('\n')) {
            pageText += ' ';
          }
          lastY = y;
        } else if (pageText.length > 0 && !pageText.endsWith(' ') && !pageText.endsWith('\n')) {
          pageText += ' ';
        }

        pageText += text;
      }

      fullText += pageText + '\n';
    }

    return fullText;
  } catch (err) {
    console.error('PDF extraction error:', err);
    throw new Error('Failed to extract text from PDF');
  }
}

export async function extractTextFromDocx(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (err) {
    console.error('DOCX extraction error:', err);
    throw new Error('Failed to extract text from DOCX');
  }
}

export async function extractTextFromFile(file: File): Promise<string> {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith('.pdf')) {
    return extractTextFromPdf(file);
  } else if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
    return extractTextFromDocx(file);
  } else {
    throw new Error('Unsupported file format. Please upload a PDF or DOCX file.');
  }
}

function extractName(text: string): string | undefined {
  const lines = text.split(/\n/).filter(line => line.trim().length > 0);

  for (const line of lines.slice(0, 10)) {
    const trimmed = line.trim();

    // Skip lines with email or phone
    if (trimmed.match(EMAIL_REGEX) || trimmed.match(PHONE_REGEX)) {
      continue;
    }

    // Skip URLs
    if (trimmed.match(/https?:\/\//i)) {
      continue;
    }

    // Skip very short or very long lines
    if (trimmed.length < 3 || trimmed.length > 50) {
      continue;
    }

    // Skip lines that look like headers/titles
    const lowerLine = trimmed.toLowerCase();
    if (['resume', 'cv', 'curriculum vitae', 'profile', 'summary'].some(w => lowerLine.includes(w))) {
      continue;
    }

    const words = trimmed.split(/\s+/);
    if (words.length >= 2 && words.length <= 4) {
      // Check if all words are capitalized (likely a name)
      const allCapitalized = words.every(word =>
        word.length > 0 && /^[A-Z]/.test(word)
      );
      if (allCapitalized) {
        return trimmed;
      }
    }
  }

  return undefined;
}

function extractEmail(text: string): string | undefined {
  // Normalize text - replace common @ symbol variations from PDFs
  const normalized = text
    .replace(/\uff20/g, '@')  // Fullwidth @
    .replace(/\u0040/g, '@')  // Standard @ (explicit)
    .replace(/\s*@\s*/g, '@') // Remove spaces around @
    .replace(/\[at\]/gi, '@') // [at] placeholder
    .replace(/\(at\)/gi, '@') // (at) placeholder
    .replace(/\s+dot\s+/gi, '.'); // "dot" placeholder

  const matches = normalized.match(EMAIL_REGEX);
  if (matches?.[0]) {
    return matches[0].toLowerCase();
  }

  // Fallback: look for common email domains and extract
  const domainMatch = normalized.match(/([a-zA-Z0-9._%+-]+)\s*@\s*(gmail|yahoo|hotmail|outlook|icloud|proton|hey|pm)\s*\.\s*(com|net|org|io|me)/i);
  if (domainMatch) {
    return `${domainMatch[1]}@${domainMatch[2]}.${domainMatch[3]}`.toLowerCase();
  }

  return undefined;
}

function extractPhone(text: string): string | undefined {
  const matches = text.match(PHONE_REGEX);
  if (matches?.[0]) {
    // Clean up the phone number
    const cleaned = matches[0].replace(/[^\d+]/g, '');
    if (cleaned.length >= 10) {
      return cleaned.startsWith('1') && cleaned.length === 11
        ? '+' + cleaned
        : cleaned;
    }
  }
  return undefined;
}

// Job title patterns - match anywhere in line (not just start)
const TITLE_PATTERNS = [
  // Engineers and developers
  /(senior|staff|principal|junior|lead|head|chief)?\s*(software|frontend|backend|fullstack|full-stack|mobile|web|data|ml|ai|devops|cloud|platform|systems?|site reliability|sre|qa|quality)?\s*(engineer|developer|architect|programmer)/i,
  // Scientists and researchers
  /(data|research|ml|ai|machine learning)?\s*scientist/i,
  // Managers
  /(engineering|product|project|program|technical|general|account|marketing|sales|operations?|hr|people|customer success|community|brand|growth|content|social media)?\s*manager/i,
  // Directors and VPs - flexible matching for "VP of Product" or "Vice President, Product"
  /(director|vp|vice president|head|chief)[\s,]*(of\s+)?(engineering|product|design|marketing|sales|operations|technology|people|hr|growth|revenue|customer|platform|platforms)/i,
  // Standalone VP/Director titles
  /\b(vice president|vp|director|head of)\b/i,
  // C-suite
  /\b(cto|ceo|cfo|coo|cpo|cmo|ciso)\b/i,
  // Designers
  /(ux|ui|product|visual|graphic|interaction|ui\/ux|brand|motion|web)?\s*designer/i,
  // Analysts
  /(data|business|financial|systems?|security|research|marketing|product)?\s*analyst/i,
  // Consultants
  /(technical|management|strategy|senior|it|business)?\s*consultant/i,
  // Founders
  /(co-?)?\s*founder/i,
  // Recruiters and HR
  /(technical|senior|lead|talent|corporate)?\s*(recruiter|talent acquisition|sourcer)/i,
  // Sales and business development
  /(account|sales|business development|enterprise)?\s*(executive|representative|rep|specialist|associate)/i,
  // Coordinators
  /(marketing|hr|project|event|operations|recruiting|talent)?\s*coordinator/i,
  // Specialists
  /(marketing|seo|content|technical|support|it|security)?\s*specialist/i,
  // Other common titles
  /\b(copywriter|editor|writer|strategist|planner|buyer|trader|accountant|attorney|lawyer|paralegal|nurse|therapist|pharmacist|teacher|instructor|professor|coach|trainer)\b/i,
];

// Words that indicate this is NOT a title line (section headers, bullet points)
const TITLE_BLACKLIST = [
  'skills', 'experience', 'education', 'projects', 'summary', 'objective',
  'tools', 'technologies', 'languages', 'frameworks', 'certifications',
  'references', 'contact', 'about', 'profile', 'interests', 'hobbies',
  'technical proficiency', 'technical skills', 'core competencies',
  'responsible for', 'worked on', 'developed', 'created', 'built', 'designed',
  'impact', 'achieved', 'increased', 'decreased', 'improved', 'led',
];

// Date patterns to strip from lines before title matching
const DATE_PATTERNS = [
  /,?\s*(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}\s*[-–—]\s*(?:present|current|\d{4}|(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4})/gi,
  /,?\s*\d{1,2}\/\d{4}\s*[-–—]\s*(?:present|current|\d{1,2}\/\d{4})/gi,
  /,?\s*\d{4}\s*[-–—]\s*(?:present|current|\d{4})/gi,
];

// Strip dates from a line
function stripDates(line: string): string {
  let cleaned = line;
  for (const pattern of DATE_PATTERNS) {
    cleaned = cleaned.replace(pattern, '');
  }
  return cleaned.trim();
}

// Business suffixes that indicate a company name (moved early for use in extractTitleFromLine)
const COMPANY_SUFFIXES = /(?:Inc|LLC|Corp|Ltd|Co|AG|GmbH|SARL|SA|SL|PLC|LP|LLP)\.?$/i;

// Extract title from a line, returning null if not a valid title
function extractTitleFromLine(line: string): string | null {
  // First strip dates from the line
  const cleanedLine = stripDates(line);
  const lowerLine = cleanedLine.toLowerCase();

  // Check if line contains a title keyword
  const matchesPattern = TITLE_PATTERNS.some(pattern => pattern.test(lowerLine));
  if (!matchesPattern) return null;

  // Clean the title - remove common separators and what follows
  let title = cleanedLine
    .replace(/\s+(?:at|@)\s+.+$/i, '') // Remove "at Company"
    .replace(/\s*[|–—]\s*.+$/, '') // Remove "| Company" or "– Company"
    .trim();

  // Only strip ", Company Name" if it has a business suffix
  // This preserves titles like "Vice President, Product Platforms"
  const commaMatch = title.match(/^(.+),\s*([A-Z][a-zA-Z\s&]+)$/);
  if (commaMatch) {
    const afterComma = commaMatch[2].trim();
    // Only strip if it has business suffix (Inc, LLC, etc.)
    if (COMPANY_SUFFIXES.test(afterComma)) {
      title = commaMatch[1].trim();
    }
    // If after comma looks like a title function, keep the whole thing
    // Otherwise keep it as-is (could be either title or company)
  }

  // Validate length
  if (title.length < 3 || title.length > 60) return null;

  return title;
}

// Invalid company names (dates, time words, common non-company text)
const COMPANY_BLACKLIST = [
  'present', 'current', 'now', 'today', 'ongoing',
  'remote', 'hybrid', 'onsite', 'contract', 'freelance',
  'full-time', 'part-time', 'fulltime', 'parttime',
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
];

// Validate company name
function isValidCompany(company: string): boolean {
  const lower = company.toLowerCase();
  // Too short or too long
  if (company.length < 2 || company.length > 50) return false;
  // Starts with a year
  if (company.match(/^\d{4}/)) return false;
  // Is a blacklisted word
  if (COMPANY_BLACKLIST.includes(lower)) return false;
  // Contains blacklisted title words
  if (TITLE_BLACKLIST.some(w => lower.includes(w))) return false;
  // Is just a number
  if (company.match(/^\d+$/)) return false;
  return true;
}

// Functional areas that appear after commas in titles (NOT companies)
const TITLE_FUNCTIONS = [
  'product', 'engineering', 'technology', 'operations', 'sales',
  'marketing', 'design', 'finance', 'people', 'hr', 'human resources',
  'platform', 'platforms', 'growth', 'revenue', 'customer success',
  'data', 'analytics', 'strategy', 'business', 'development',
  'management', 'innovation', 'digital', 'experience', 'success',
];

// Check if text after comma looks like a title function (not a company)
function looksTitleFunction(text: string): boolean {
  const lower = text.toLowerCase();
  return TITLE_FUNCTIONS.some(f => lower.includes(f));
}

// Extract company from a line that has title, returning null if not found
function extractCompanyFromLine(line: string): string | null {
  // Try "at Company" or "@ Company"
  const atMatch = line.match(/\s+(?:at|@)\s+(.+)$/i);
  if (atMatch) {
    const company = atMatch[1].trim().replace(/[,.\s]+$/, '');
    if (isValidCompany(company)) {
      return company;
    }
  }

  // Try "Title | Company" or "Title – Company"
  const sepMatch = line.match(/\s*[|–—]\s*(.+)$/);
  if (sepMatch) {
    const company = sepMatch[1].trim().replace(/[,.\s]+$/, '');
    if (isValidCompany(company)) {
      return company;
    }
  }

  // Try "Title, Company Name" - but ONLY if it has a business suffix
  // This prevents "Vice President, Product Platforms" from being split incorrectly
  const commaMatch = line.match(/,\s*([A-Z][a-zA-Z\s&]+)$/);
  if (commaMatch) {
    const potentialCompany = commaMatch[1].trim().replace(/[,.\s]+$/, '');
    // Only accept as company if it has a business suffix (Inc, LLC, etc.)
    // OR if it doesn't look like a title function (Product, Engineering, etc.)
    const hasBusinessSuffix = COMPANY_SUFFIXES.test(potentialCompany);
    const isTitleFunction = looksTitleFunction(potentialCompany);

    if (hasBusinessSuffix && isValidCompany(potentialCompany)) {
      return potentialCompany;
    }
    // If no business suffix and looks like a title function, don't extract as company
    if (isTitleFunction) {
      return null;
    }
  }

  return null;
}

// Check if a line looks like a company line (company name potentially with date)
// e.g., "Elentra                    May 2022 – Present" or just "WeTransfer"
function looksLikeCompanyLine(line: string): boolean {
  const stripped = stripDates(line).trim();

  // Must be short (company names are usually 1-5 words)
  if (stripped.length < 2 || stripped.length > 60) return false;
  const words = stripped.split(/\s+/);
  if (words.length > 5) return false;

  // Must start with capital letter
  if (!/^[A-Z]/.test(stripped)) return false;

  // Must NOT match title patterns
  if (TITLE_PATTERNS.some(p => p.test(stripped.toLowerCase()))) return false;

  // Must NOT be blacklisted
  if (TITLE_BLACKLIST.some(w => stripped.toLowerCase().includes(w))) return false;

  // Must NOT start with bullet
  if (/^[•·\-\*]/.test(line)) return false;

  return isValidCompany(stripped);
}

// Try to extract "Company – Title" format (e.g., "Department of National Defence – Junior Software Developer")
function extractCompanyTitleFromLine(line: string): { company?: string; title?: string } | null {
  const stripped = stripDates(line);

  // Look for "Company – Title" or "Company - Title" pattern
  const dashMatch = stripped.match(/^(.+?)\s*[–—-]\s*(.+)$/);
  if (dashMatch) {
    const beforeDash = dashMatch[1].trim();
    const afterDash = dashMatch[2].trim();

    // Check if after dash looks like a title
    const afterDashLower = afterDash.toLowerCase();
    const isTitle = TITLE_PATTERNS.some(p => p.test(afterDashLower));

    if (isTitle && isValidCompany(beforeDash)) {
      return { company: beforeDash, title: afterDash };
    }
  }

  return null;
}

function extractTitleAndCompany(text: string, foundName?: string): { title?: string; company?: string } {
  const lines = text.split(/\n/).filter(line => line.trim().length > 0);

  // Skip past the name if we found it
  let startIndex = 0;
  if (foundName) {
    for (let i = 0; i < Math.min(lines.length, 5); i++) {
      if (lines[i].trim().toLowerCase().includes(foundName.toLowerCase().split(' ')[0])) {
        startIndex = i + 1;
        break;
      }
    }
  }

  // Two-pass approach:
  // 1. Look for standalone titles and find company by searching backward (preferred - finds most recent job)
  // 2. Fallback to "Company – Title" format if no standalone title found

  let titleOnlyResult: { title: string; lineIndex: number } | null = null;

  // Pass 1: Look for standalone titles with backward company search
  for (let i = startIndex; i < Math.min(lines.length, startIndex + 30); i++) {
    const line = lines[i].trim();

    // Strip dates before checking blacklist
    const dateStrippedLine = stripDates(line);
    const lowerLine = dateStrippedLine.toLowerCase();

    // Skip very short lines
    if (dateStrippedLine.length < 5) continue;

    // Skip lines with contact info
    if (line.match(EMAIL_REGEX) || line.match(PHONE_REGEX)) continue;
    if (line.toLowerCase().match(/https?:\/\//)) continue;

    // Skip blacklisted lines (check after stripping dates)
    if (TITLE_BLACKLIST.some(word => lowerLine.includes(word))) continue;

    // Skip lines that look like skill lists
    if (lowerLine.match(/:\s*\w+\s*,/)) continue;
    if (line.match(/^[•·\-\*]\s/)) continue;

    // Skip lines with too many words
    if (line.split(/\s+/).length > 12) continue;

    // Try to extract title from this line
    const title = extractTitleFromLine(line);
    if (title) {
      // Try to extract company from the same line first
      let company = extractCompanyFromLine(dateStrippedLine);

      // If no company found, search backwards for company line (up to 10 lines)
      if (!company) {
        for (let j = i - 1; j >= Math.max(startIndex, i - 10); j--) {
          const prevLine = lines[j].trim();

          // Skip empty or very short lines
          if (prevLine.length < 2) continue;

          // Skip bullet points and long lines
          if (prevLine.match(/^[•·\-\*]\s/)) continue;
          if (prevLine.split(/\s+/).length > 6) continue;

          // Check if this line looks like a company
          if (looksLikeCompanyLine(prevLine)) {
            company = stripDates(prevLine).trim();
            break;
          }
        }
      }

      // If we found title + company, return immediately (preferred)
      if (company) {
        return { title, company };
      }

      // Store first title-only result as fallback
      if (!titleOnlyResult) {
        titleOnlyResult = { title, lineIndex: i };
      }
    }
  }

  // Pass 2 (fallback): Try "Company – Title" format if no standalone title found with company
  for (let i = startIndex; i < Math.min(lines.length, startIndex + 30); i++) {
    const line = lines[i].trim();

    // Skip very short lines
    if (line.length < 5) continue;

    // Skip contact info and bullets
    if (line.match(EMAIL_REGEX) || line.match(PHONE_REGEX)) continue;
    if (line.toLowerCase().match(/https?:\/\//)) continue;
    if (line.match(/^[•·\-\*]\s/)) continue;

    // Try "Company – Title" format
    const companyTitle = extractCompanyTitleFromLine(line);
    if (companyTitle?.company && companyTitle?.title) {
      return companyTitle;
    }
  }

  // Final fallback: return title-only if found
  if (titleOnlyResult) {
    return { title: titleOnlyResult.title, company: undefined };
  }

  return {};
}

function extractLinks(text: string): CandidateLink[] {
  const links: CandidateLink[] = [];
  const seenUrls = new Set<string>();

  // LinkedIn
  const linkedinMatches = text.match(LINKEDIN_REGEX) || [];
  for (const match of linkedinMatches) {
    let url = match.toLowerCase();
    if (!url.startsWith('http')) {
      url = 'https://' + url;
    }
    if (!seenUrls.has(url)) {
      seenUrls.add(url);
      links.push({ type: 'linkedin', url });
    }
  }

  // GitHub
  const githubMatches = text.match(GITHUB_REGEX) || [];
  for (const match of githubMatches) {
    let url = match.toLowerCase();
    if (!url.startsWith('http')) {
      url = 'https://' + url;
    }
    if (!seenUrls.has(url)) {
      seenUrls.add(url);
      links.push({ type: 'github', url });
    }
  }

  // Other URLs (portfolio, personal sites, etc.)
  const allUrls = text.match(URL_REGEX) || [];
  for (const url of allUrls) {
    const lowerUrl = url.toLowerCase();
    // Skip already captured social links
    if (lowerUrl.includes('linkedin.com') || lowerUrl.includes('github.com')) {
      continue;
    }
    // Skip common non-portfolio URLs
    if (lowerUrl.includes('google.com') || lowerUrl.includes('facebook.com') ||
        lowerUrl.includes('twitter.com') || lowerUrl.includes('mailto:')) {
      continue;
    }
    if (!seenUrls.has(lowerUrl)) {
      seenUrls.add(lowerUrl);
      // Determine if it's likely a portfolio
      const isPortfolio = lowerUrl.includes('portfolio') ||
                          lowerUrl.includes('behance') ||
                          lowerUrl.includes('dribbble') ||
                          lowerUrl.includes('.dev') ||
                          lowerUrl.includes('.design');
      links.push({
        type: isPortfolio ? 'portfolio' : 'other',
        url: url,
        label: isPortfolio ? 'Portfolio' : undefined
      });
    }
  }

  return links.slice(0, 5); // Limit to 5 links
}

export async function parseResume(file: File): Promise<ParsedResume> {
  const rawText = await extractTextFromFile(file);

  // Extract structured data first
  const email = extractEmail(rawText);
  const phone = extractPhone(rawText);
  const links = extractLinks(rawText);

  // Create cleaned text by removing URLs, emails, and phones for name extraction
  let cleanedText = rawText;

  // Remove all URLs
  cleanedText = cleanedText.replace(URL_REGEX, '');
  cleanedText = cleanedText.replace(LINKEDIN_REGEX, '');
  cleanedText = cleanedText.replace(GITHUB_REGEX, '');

  // Remove emails
  cleanedText = cleanedText.replace(EMAIL_REGEX, '');

  // Remove phone numbers
  cleanedText = cleanedText.replace(PHONE_REGEX, '');

  // Collapse multiple spaces within lines, but preserve newlines
  cleanedText = cleanedText.replace(/[^\S\n]+/g, ' ');
  // Trim each line
  cleanedText = cleanedText.split('\n').map(line => line.trim()).join('\n');

  const name = extractName(cleanedText);
  const { title, company } = extractTitleAndCompany(cleanedText, name);

  return {
    name,
    email,
    phone,
    title,
    company,
    links,
    rawText,
  };
}
