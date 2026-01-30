import { Modal } from './common/Modal';

interface PrivacyPolicyProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyPolicy({ isOpen, onClose }: PrivacyPolicyProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Privacy & Your Data">
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 text-deep-brown">
        {/* The Promise */}
        <section>
          <h3 className="font-headline text-lg font-semibold text-sage mb-2">
            The Short Version
          </h3>
          <p className="text-sm leading-relaxed">
            Your data never touches our servers. We couldn't access it even if we wanted to.
            Everything stays on your computer, in files you can see and control.
          </p>
        </section>

        {/* How It Works */}
        <section>
          <h3 className="font-headline text-lg font-semibold text-sage mb-2">
            How Lineup Works
          </h3>
          <div className="text-sm leading-relaxed space-y-3">
            <p>
              Lineup is a static web application. That means it runs entirely in your browser—there's
              no backend, no database, no cloud storage on our end.
            </p>
            <p>
              When you add candidates, jobs, or upload resumes, that data is stored in one of two places:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2 text-brown">
              <li>
                <strong>Your chosen folder</strong> — If you grant folder access, Lineup saves
                human-readable JSON files right on your computer. You can open them in any text editor.
              </li>
              <li>
                <strong>Browser storage</strong> — If you skip folder access, data stays in your
                browser's local storage. Still local, still yours.
              </li>
            </ul>
          </div>
        </section>

        {/* Resume Parsing */}
        <section>
          <h3 className="font-headline text-lg font-semibold text-sage mb-2">
            Resume Parsing
          </h3>
          <div className="text-sm leading-relaxed space-y-3">
            <p>
              Lineup can extract information from PDF and DOCX resume files. This parsing happens
              entirely in your browser:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2 text-brown">
              <li>
                <strong>PDF files</strong> — Parsed using PDF.js, an open-source library by Mozilla
              </li>
              <li>
                <strong>DOCX files</strong> — Parsed using mammoth.js, an open-source document converter
              </li>
            </ul>
            <p>
              The resume content is processed locally to extract names, emails, phone numbers, and
              other details. None of this data is ever sent to any server—it stays on your machine.
            </p>
          </div>
        </section>

        {/* What We Don't Do */}
        <section>
          <h3 className="font-headline text-lg font-semibold text-sage mb-2">
            What We Don't Do
          </h3>
          <ul className="text-sm leading-relaxed space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-sage mt-0.5">✗</span>
              <span>We don't collect your candidate data</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-sage mt-0.5">✗</span>
              <span>We don't track who you're hiring or how</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-sage mt-0.5">✗</span>
              <span>We don't use invasive analytics (we use{' '}
                <a
                  href="https://www.goatcounter.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sage hover:text-moss underline"
                >
                  GoatCounter
                </a>
                —no cookies, no personal data, just page views)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-sage mt-0.5">✗</span>
              <span>We don't sell data (we literally don't have any)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-sage mt-0.5">✗</span>
              <span>We don't train AI models on your resumes</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-sage mt-0.5">✗</span>
              <span>We don't upload your files anywhere</span>
            </li>
          </ul>
        </section>

        {/* Why We Built This */}
        <section>
          <h3 className="font-headline text-lg font-semibold text-sage mb-2">
            Why We Built This
          </h3>
          <div className="text-sm leading-relaxed space-y-3">
            <p>
              Most ATS platforms are built for enterprises with dedicated HR teams and big budgets.
              They want your data because that's their business model.
            </p>
            <p>
              Lineup is different. It's a free resource for small and scaling teams who want to
              improve their candidate journey without the overhead of enterprise software. Better
              organization means fewer dropped balls, faster responses, and a more human experience
              for everyone involved.
            </p>
            <p>
              We're recruiters ourselves at{' '}
              <a
                href="https://baselinetalent.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sage hover:text-moss underline"
              >
                Baseline Talent
              </a>
              —we built what we wished existed.
            </p>
          </div>
        </section>

        {/* Your Responsibility */}
        <section className="bg-cream/50 rounded-lg p-4 border border-brown/10">
          <h3 className="font-headline text-lg font-semibold text-brown mb-2">
            Your Responsibility
          </h3>
          <div className="text-sm leading-relaxed space-y-3 text-stone">
            <p>
              Since your data lives on your machine, you're responsible for:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Backing up your data (export regularly!)</li>
              <li>Securing your computer and browser</li>
              <li>Complying with any applicable privacy laws in your jurisdiction (GDPR, CCPA, etc.)</li>
              <li>How you handle candidate information</li>
            </ul>
            <p className="mt-3 text-xs">
              Lineup is provided "as is" without warranty. We're not liable for data loss, security
              breaches on your end, or how you choose to use the tool. By using Lineup, you accept
              these terms.
            </p>
          </div>
        </section>

        {/* Open Source */}
        <section>
          <h3 className="font-headline text-lg font-semibold text-sage mb-2">
            Open Source = Transparency
          </h3>
          <p className="text-sm leading-relaxed">
            Lineup is open source. You can read every line of code to verify we're not doing
            anything sketchy. If you don't trust us, trust the code.
          </p>
        </section>

        {/* Contact */}
        <section className="pt-2 border-t border-brown/10">
          <p className="text-sm text-stone">
            Questions? Reach out at{' '}
            <a
              href="mailto:phil@baselinetalent.xyz"
              className="text-sage hover:text-moss underline"
            >
              phil@baselinetalent.xyz
            </a>
          </p>
          <p className="text-xs text-stone/60 mt-2">
            Last updated: January 2026
          </p>
        </section>
      </div>
    </Modal>
  );
}
