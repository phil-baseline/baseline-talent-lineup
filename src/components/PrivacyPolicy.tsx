import { Modal } from './common/Modal';

interface PrivacyPolicyProps {
  isOpen: boolean;
  onClose: () => void;
}

const h3 = 'font-semibold mb-2';
const link = 'text-ink underline hover:text-accent';

export function PrivacyPolicy({ isOpen, onClose }: PrivacyPolicyProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Privacy and your data">
      <div className="space-y-8 leading-relaxed max-w-[65ch]">
        <section>
          <h3 className={h3}>The short version</h3>
          <p>
            Your data never reaches a server. Lineup has no backend, so there is nothing to send it to. Everything stays on
            your computer.
          </p>
        </section>

        <section>
          <h3 className={h3}>Where your data lives</h3>
          <p className="mb-2">Lineup is a static web page. It runs in your browser and saves to one of two places.</p>
          <p className="mb-2">
            A folder you choose. Lineup writes plain JSON files you can open in any text editor.
          </p>
          <p>Your browser's local storage, if you skip the folder. It is still only on this machine.</p>
        </section>

        <section>
          <h3 className={h3}>Resume parsing</h3>
          <p>
            Lineup reads PDF and DOCX resumes in your browser, using PDF.js and mammoth.js. Both are open source. The file
            and its text are never uploaded.
          </p>
        </section>

        <section>
          <h3 className={h3}>What Lineup does not do</h3>
          <p className="mb-2">It does not collect, sell or upload your candidate data or files.</p>
          <p className="mb-2">It does not train AI models on your resumes.</p>
          <p>
            It counts page views with{' '}
            <a href="https://www.goatcounter.com/" target="_blank" rel="noopener noreferrer" className={link}>
              GoatCounter
            </a>
            . No cookies and no personal data.
          </p>
        </section>

        <section>
          <h3 className={h3}>Your part</h3>
          <p className="mb-2">
            Since the data lives on your machine, you look after it. Back it up with Export. Keep your computer and browser
            secure. Follow the privacy laws that apply to you, such as PIPEDA, GDPR or CCPA.
          </p>
          <p className="text-muted">
            Lineup is provided as is, without warranty. By using it you accept that the author is not liable for data loss
            or how the tool is used.
          </p>
        </section>

        <section>
          <h3 className={h3}>Open source</h3>
          <p>
            You can read every line of the{' '}
            <a
              href="https://github.com/phil-baseline/baseline-talent-lineup"
              target="_blank"
              rel="noopener noreferrer"
              className={link}
            >
              source code
            </a>{' '}
            to check all of this.
          </p>
        </section>

        <section>
          <p>
            Questions? Email{' '}
            <a href="mailto:phil@baselinetalent.xyz" className={link}>
              phil@baselinetalent.xyz
            </a>
            .
          </p>
          <p className="text-sm text-muted mt-2">Last updated October 2026</p>
        </section>
      </div>
    </Modal>
  );
}
