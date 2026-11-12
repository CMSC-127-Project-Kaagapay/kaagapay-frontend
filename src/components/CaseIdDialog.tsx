import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MotionConfig, motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface CaseIdDialogProps {
  caseId: string;
  status: string;
  onClose: () => void;
}

function statusSentence(status: string): string {
  if (status === 'requested') return "Sent to the volunteer you chose. If they don't respond in 15 minutes, it goes to all volunteers.";
  if (status === 'pending') return 'Waiting for a volunteer to take your report.';
  return `Status: ${status.replace(/_/g, ' ')}`;
}

/** Draws a plain card with the Case ID and where to track it. It holds no report details. */
async function renderCaseCard(caseId: string): Promise<Blob> {
  const css = getComputedStyle(document.documentElement);
  const token = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;
  const family = css.getPropertyValue('--font-sans').trim() || 'Manrope, sans-serif';
  await Promise.all([document.fonts.load(`800 84px ${family}`), document.fonts.load(`600 28px ${family}`)]).catch(() => undefined);

  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is not available.');

  ctx.fillStyle = token('--color-surface-container-lowest', 'white');
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = token('--color-outline-variant', 'gray');
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

  const text = (value: string, y: number, font: string, color: string) => {
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(value, 72, y);
  };
  const primary = token('--color-primary', 'purple');
  const body = token('--color-on-surface', 'black');
  const muted = token('--color-on-surface-variant', 'gray');

  text('Project Kaagapay', 112, `800 36px ${family}`, primary);
  text('Your Case ID', 224, `600 28px ${family}`, muted);
  ctx.letterSpacing = '1px';
  // Same monospace face as on screen, so a letter O and a zero (or I and 1) can be told apart when typed back in.
  text(caseId, 330, '700 76px ui-monospace, Menlo, Consolas, monospace', primary);
  ctx.letterSpacing = '0px';
  text(`To check on your report, open the Track page: ${window.location.origin}/track`, 430, `600 28px ${family}`, body);
  text('Keep this private. Anyone with this ID can see the status of your report.', 490, `500 26px ${family}`, muted);
  text(`Saved on ${new Date().toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' })}`, 570, `500 24px ${family}`, muted);

  return new Promise((resolve, reject) => canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not create the image.'))), 'image/png'));
}

// Same button language as the rest of the app: a full-width extrabold primary (the old "Done"), and the soft
// grey-pink fill of the old copy button for secondary actions. The outline keeps the edge visible (3:1 contrast).
const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';
const secondary = `min-h-12 rounded-xl border border-outline bg-surface-container px-5 text-sm font-bold text-on-surface transition-colors hover:bg-surface-container-high disabled:opacity-60 ${focusRing}`;
const primaryButton = `min-h-12 rounded-2xl bg-primary px-6 py-3.5 font-extrabold text-on-primary transition-all hover:opacity-90 active:scale-[0.98] motion-reduce:active:scale-100 ${focusRing}`;

export default function CaseIdDialog({ caseId, status, onClose }: CaseIdDialogProps) {
  const headingId = useId();
  const bodyId = useId();
  const confirmTitleId = useId();
  const confirmBodyId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLButtonElement>(null);
  const goBackRef = useRef<HTMLButtonElement>(null);

  const [copied, setCopied] = useState(false);
  const [imageSaved, setImageSaved] = useState(false);
  const [savingImage, setSavingImage] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const saved = copied || imageSaved;

  useEffect(() => {
    copyRef.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    if (confirming) goBackRef.current?.focus();
    else if (dialogRef.current?.contains(document.activeElement) === false) copyRef.current?.focus();
  }, [confirming]);

  // Reloading or closing the tab would lose the ID, so ask first until it has been saved.
  useEffect(() => {
    if (saved) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [saved]);

  const requestClose = () => (saved ? onClose() : setConfirming(true));

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      if (confirming) setConfirming(false);
      else requestClose();
      return;
    }
    if (event.key !== 'Tab') return;
    const scope = confirming ? confirmRef.current : dialogRef.current;
    const focusable = scope?.querySelectorAll<HTMLElement>('button:not([disabled])');
    if (!focusable || focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const handleCopy = async () => {
    setProblem(null);
    try {
      await navigator.clipboard.writeText(caseId);
      setCopied(true);
    } catch {
      setProblem("Couldn't copy. Select the Case ID and copy it by hand.");
    }
  };

  const handleSaveImage = async () => {
    setProblem(null);
    setSavingImage(true);
    try {
      const blob = await renderCaseCard(caseId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `kaagapay-case-${caseId}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setImageSaved(true);
    } catch (err: any) {
      setProblem(`Couldn't save the image: ${err.message} Copy the Case ID instead.`);
    } finally {
      setSavingImage(false);
    }
  };

  return createPortal(
    <MotionConfig reducedMotion="user">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/50 px-4"
        onKeyDown={handleKeyDown}
      >
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={headingId}
          aria-describedby={bodyId}
          {...(confirming ? ({ inert: true } as object) : {})}
          className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-3xl bg-surface-container-lowest p-6 shadow-2xl sm:p-8"
        >
          <h2 id={headingId} className="font-headline text-2xl font-extrabold text-on-surface">Report Submitted</h2>
          <p id={bodyId} className="mt-2 text-sm leading-relaxed text-on-surface-variant">
            We've received your report. Keep your Case ID. It's the only way to check on your report, and it won't be shown again.
          </p>

          <div className="mt-6 rounded-2xl bg-surface-container-low p-5">
            <p className="text-sm font-semibold text-on-surface-variant">Your Case ID</p>
            <p className="mt-1 select-all break-all font-mono text-2xl font-extrabold tracking-wide text-primary" data-testid="case-id">{caseId}</p>
            <p className="mt-3 text-sm text-on-surface-variant">
              To check on your report, open the Track page and enter this Case ID. Keep it private: anyone with this ID can see the status of your report.
            </p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button ref={copyRef} type="button" onClick={handleCopy} className={secondary}>
              {copied ? 'Copied' : 'Copy Case ID'}
            </button>
            <button type="button" onClick={handleSaveImage} disabled={savingImage} className={secondary}>
              {savingImage ? 'Saving…' : imageSaved ? 'Saved as image' : 'Save as Image'}
            </button>
          </div>
          <p className="mt-2 text-sm text-on-surface-variant">A screenshot works too.</p>

          <p role="status" className={cn('mt-3 min-h-5 text-sm font-semibold text-on-surface', !saved && 'sr-only')}>
            {copied && imageSaved ? 'Case ID copied and saved as an image.' : copied ? 'Case ID copied.' : imageSaved ? 'Case ID saved as an image.' : ''}
          </p>
          {problem && <p role="alert" className="mt-1 text-sm font-medium text-on-surface">{problem}</p>}

          <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">{statusSentence(status)}</p>

          <button type="button" onClick={requestClose} className={`${primaryButton} mt-6 w-full`}>Done</button>
        </div>

        {confirming && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-on-surface/40 px-4">
            <div
              ref={confirmRef}
              role="alertdialog"
              aria-modal="true"
              aria-labelledby={confirmTitleId}
              aria-describedby={confirmBodyId}
              className="w-full max-w-sm rounded-2xl bg-surface-container-lowest p-6 shadow-2xl"
            >
              <h3 id={confirmTitleId} className="font-headline text-xl font-bold text-on-surface">Close without saving your Case ID?</h3>
              <p id={confirmBodyId} className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                This is the only time it's shown. Without it, you can't check on your report.
              </p>
              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button type="button" onClick={onClose} className={`${secondary} w-full sm:w-auto`}>Close anyway</button>
                <button ref={goBackRef} type="button" onClick={() => setConfirming(false)} className={`${primaryButton} w-full sm:w-auto`}>Go back</button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </MotionConfig>,
    document.body,
  );
}
