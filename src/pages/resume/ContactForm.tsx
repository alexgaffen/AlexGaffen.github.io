import { type FormEvent, useRef, useState } from 'react';

/** The contact form posts to Formspree with fetch, so visitors stay on the page. */

type Status = { kind: 'idle' | 'sending' | 'success' | 'error'; text: string };

const label = 'mb-2 font-resume-mono text-[0.68rem] tracking-[0.1em] text-ink-3 uppercase';
const field =
  'w-full rounded-[8px] border border-line bg-surface px-[0.9em] py-[0.75em] text-[0.92rem] text-ink [font-family:inherit] [transition:border-color_0.2s_ease,box-shadow_0.2s_ease] focus:border-accent focus:[box-shadow:0_0_0_3px_var(--accent-soft)] focus:outline-none';
const group = 'mb-4 flex flex-col';

export function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<Status>({ kind: 'idle', text: '' });

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = formRef.current!;
    setStatus({ kind: 'sending', text: 'Sending…' });
    try {
      const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      if (res.ok) {
        form.reset();
        setStatus({ kind: 'success', text: 'Thanks! Your message has been sent.' });
      } else {
        const data = (await res.json()) as { errors?: { message: string }[] } | null;
        const msg = data?.errors ? data.errors.map((x) => x.message).join(', ') : 'Something went wrong. Please email alexgaffen@gmail.com.';
        setStatus({ kind: 'error', text: msg });
      }
    } catch {
      setStatus({ kind: 'error', text: 'Network error. Please email alexgaffen@gmail.com.' });
    }
  };

  const color = status.kind === 'success' ? 'text-accent' : status.kind === 'error' ? 'text-[#f87171]' : 'text-ink-2';
  const sending = status.kind === 'sending';

  return (
    <form ref={formRef} action="https://formspree.io/f/mqeyyljp" method="POST" onSubmit={submit}>
      <input name="_subject" type="hidden" defaultValue="New message from alexgaffen.com" />
      <input name="_gotcha" style={{ display: 'none' }} type="text" />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
        <div className={group}>
          <label className={label} htmlFor="contact-name">
            Name
          </label>
          <input className={field} id="contact-name" name="name" placeholder="Your name" required type="text" />
        </div>
        <div className={group}>
          <label className={label} htmlFor="contact-email">
            Email
          </label>
          <input className={field} id="contact-email" name="email" placeholder="your@email.com" required type="email" />
        </div>
      </div>
      <div className={group}>
        <label className={label} htmlFor="contact-message">
          Message
        </label>
        <textarea className={`${field} min-h-[120px] [resize:vertical]`} id="contact-message" name="message" placeholder="Your message..." required rows={5} />
      </div>
      <button
        className="inline-flex cursor-pointer items-center gap-[0.6em] rounded-full border-none bg-accent px-[1.6em] py-[0.8em] text-[0.9rem] font-bold text-accent-ink [font-family:inherit] [transition:transform_0.2s_cubic-bezier(0.22,1,0.36,1),filter_0.2s_ease] enabled:hover:[filter:brightness(1.08)] enabled:hover:[transform:translateY(-2px)] disabled:cursor-progress disabled:opacity-60 focus-visible:rounded-[4px]"
        type="submit"
        disabled={sending}
      >
        <i className="fas fa-paper-plane" /> Send Message
      </button>
      <p className={`m-0 mt-3 min-h-[1.2em] text-[0.85rem] ${color}`} id="contact-status" role="status" aria-live="polite">
        {status.text}
      </p>
    </form>
  );
}
