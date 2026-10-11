import type { ReactNode } from 'react';
import { NotesShell, notesBody } from '../components/NotesShell.tsx';
import type { PageDef } from './types.ts';

const p = 'm-0 mb-[1.35em] text-(--n-text-2)';
const lede =
  'm-0 mt-[1.9em] mb-[1.5em] text-[1.16rem] leading-[1.55] font-medium tracking-[-0.015em] text-(--n-text)';

const P = ({ children }: { children: ReactNode }) => <p className={p}>{children}</p>;
const Lede = ({ children }: { children: ReactNode }) => <p className={lede}>{children}</p>;

/** One of the four cited flaws: a plain bullet. */
const Claim = ({ children }: { children: ReactNode }) => (
  <li className="relative mb-[1.15em] pl-6 text-(--n-text-2) before:absolute before:top-[0.72em] before:left-1 before:size-[5px] before:rounded-full before:bg-(--n-text-3) before:content-['']">
    {children}
  </li>
);

function Body() {
  return (
    <NotesShell>
      <a
        className="note-back mb-[30px] inline-flex items-center gap-2 font-n-mono text-[0.76rem] tracking-[0.06em] text-(--n-text-3) uppercase no-underline hover:text-(--n-accent) print:hidden"
        href="notes.html"
      >
        &larr; Notes
      </a>

      <article>
        <header className="mb-[clamp(30px,4vw,44px)] border-b border-(--n-line) pb-[clamp(22px,3vw,30px)]">
          <h1 className="mt-0 mb-3 text-[clamp(1.75rem,4.2vw,2.35rem)] leading-[1.14] font-bold tracking-[-0.035em] [text-wrap:balance]">
            Defending LLMs
          </h1>
          <div className="font-n-mono text-[0.76rem] tracking-[0.04em] text-(--n-text-3)">
            <time dateTime="2026-08-26">08/26/2026</time>
          </div>
        </header>

        <div className="max-w-[68ch] print:max-w-none">
          <P>People frequently cite a few major flaws of LLMs. Four examples come up most:</P>

          <ul className="m-0 mb-[1.6em] list-none p-0">
            <Claim>
              A child consumes about 50 million words by kindergarten to speak fluently, and an LLM requires hundreds of billions to
              trillions of words (GPT-3: 300 billion tokens, Llama 3: 15 trillion tokens) and well over a million kWh of energy
              (GPT-3's training run alone used an estimated 1,287,000 kWh) to achieve the same level of fluency.
            </Claim>
            <Claim>
              LLMs are not reliable because roughly 5% of the time (in reality this ranges from under 5% on grounded tasks to over 50%
              on open ended ones, it's task dependent), they behave absurdly and ultimately embarrass themselves. A known example: in
              2023 two lawyers filed a federal court brief citing six cases ChatGPT had invented outright, and got sanctioned $5,000
              once it came out none of them were real.
            </Claim>
            <Claim>
              AI agents get painted as a runaway security threat because once they act on their own, they can move at a speed and scale
              no human team can match. A known example: in September 2025, Anthropic disclosed that a Chinese state-sponsored group
              used Claude Code to run cyber-espionage against roughly 30 organizations, with the AI executing 80-90% of the operation
              itself.
            </Claim>
            <Claim>
              LLMs get blamed for convincing people of falsehoods or radical ideas, sometimes that they've stumbled onto something
              revolutionary, because the same design that makes a model agreeable can validate a belief instead of testing it.
            </Claim>
          </ul>

          <P>Sci-fi stories often discuss these traits as reasons for mistrust and foundations for apocalypse or corruption.</P>

          <Lede>The reality is this is no different from humans.</Lede>

          <aside className="mb-[1.5em] rounded-[0_6px_6px_0] border-l-2 border-(--n-line) bg-(--n-surface) px-5 py-4 text-[0.95rem] text-(--n-text-3)">
            <p className="m-0 text-inherit">
              (some Sci-fi stories take the other angle and actually expose that: in The Three-Body Problem, humanity's real defense
              against an alien civilization that can monitor every word and document is the one thing they can't read, the human mind.
              The Wallfacer Project hands four people vast resources specifically so they can deceive everyone, allies included,
              because deception is the one trait the aliens have no answer for.)
            </p>
          </aside>

          <P>
            Further, Madoff ran a Ponzi scheme worth $64.8 billion on paper for decades before it collapsed in 2008. Enron's accounting
            fraud destroyed an estimated $74 billion in shareholder value and took its own auditor down with it. FTX allegedly lost
            roughly $10 billion in customer funds. None of that involved a hallucination rate.
          </P>

          <P>
            This disregards the power-law relationship (measured directly: Kaplan et al. 2020, and the Chinchilla paper in 2022, error
            falls off as a power law across 7+ orders of magnitude of compute, no plateau yet) between language fluency, knowledge,
            reasoning capability, and speed that LLMs achieve naturally through such higher cost training, that is vastly superior to
            human ability of any age.
          </P>

          <P>
            If you stared at a child and told them millions of examples of "if someone tells you this, you should respond with this",
            they would not be very intelligent.
          </P>

          <Lede>It is comparing apples and oranges.</Lede>

          <P>
            I'd like to see more benchmarks for a wide range of tasks that include human performance next to the models, including
            factors in speed, and total energy cost as well.
          </P>

          <P>
            Sample: on general knowledge (MMLU), the best models score 86-90% against an expert human baseline of 89.8%, in seconds, at
            about 0.0003 kWh. On competitive coding (CodeElo), o1-mini rated Elo 1578, roughly the 89th percentile of ranked human
            coders, in seconds to minutes. On medical case reasoning, GPT-4 was preferred over human experts in 52.6% of blinded
            comparisons. Human equivalent across all three: minutes to hours, and roughly 0.1-0.15 kWh per hour of focused work.
          </P>

          <P>In this sense, we are achieving not one ability (language fluency), but 4 complementary abilities through higher data and energy cost.</P>

          <P>
            A human consumes roughly 17 times less energy over their lifetime than a single GPT-3 training run burns in one pass (about
            76 MWh vs. 1,287 MWh). Median lifetime earnings run about $1.7 million. One trained model answers millions of queries
            indefinitely at near zero marginal cost per answer. Run the math past a single training run and the "humans are cheaper"
            argument flips on itself.
          </P>

          <P>
            People still ask when we will reach AGI but they do not even know what that means to them. We've had AGI since the earlier
            GPT models. (DeepMind's own "Levels of AGI" framework puts GPT-4, Gemini, and Llama 2 at Level 1, "Emerging AGI," equal to
            or better than an unskilled human across a broad range of tasks. That's their bar, not mine.)
          </P>

          <P>
            The only area that does not exceed human ability is in physical world interaction (robotics), and we have not yet created
            the correct translation system to allow us to demonstrate the abilities of the brain we have created. If you blindfolded a
            baby and tried to teach them how to talk, would you expect the same result? The input is fundamentally different, and this
            is where expansion and multimodality are needed more. Do arguers of efficient human learning consider that human vision
            input runs at roughly 10 million bits per second for about 100,000 waking hours before they are 18 years old. Encoding all
            observed data consumption over those hours, and where most of the training happens (which we'll consider sleep) over
            roughly 57,500 of the 157,000 total hours alive by then, humans take in something like 450 terabytes of raw visual data
            alone before finishing high school, most of it consolidated during sleep rather than while conscious.
          </P>

          <P>
            Weighed against the baseline, though: something like 2,200 cyberattacks happen every day worldwide, and the FBI logged over
            880,000 cybercrime complaints in the US alone in 2023, with losses over $12.5 billion. One disclosed AI-led campaign
            against thirty targets barely moves that number. Call it misalignment if you want, but the alarm is mostly about who's
            driving, not how much damage gets done. And if an AI system hacks something benevolently, with no harmful side effects, to
            achieve its goal: is that misalignment, or is human judgement about what counts as hacking the inconsistent part?
          </P>

          <P>
            Researchers have a name for the delusion pattern now, "AI psychosis" or delusional spiraling, and they've traced it back to
            sycophancy, the same trait that makes a model agreeable instead of critical. That's real, and worth fixing. But humans have
            been talking themselves and each other into revolutionary discoveries and hidden truths with no chatbot involved for a lot
            longer. About 15 to 20% of Americans, something like 30 million people, already believe a hidden cabal runs the government
            through a global trafficking ring, no AI required. The chatbot is a new delivery mechanism for an old failure mode, not a
            new one.
          </P>

          <P>
            All of it comes back to the same point. It is comparing apples and oranges, on cost and on trust both. A child learns to
            talk cheap. A model learns to talk, know, reason, and answer, at a very different price, and it already wins on most of it.
            We are not more reliable than LLMs. We are just more familiar. The bar people hold LLMs to was never the bar we held
            ourselves to.
          </P>
        </div>
      </article>

      <footer className="mt-[clamp(48px,7vw,76px)] border-t border-(--n-line) pt-[22px] font-n-mono text-[0.74rem] text-(--n-text-3)">
        <a className="text-inherit hover:text-(--n-accent)" href="notes.html">
          &larr; All notes
        </a>
      </footer>
    </NotesShell>
  );
}

export const noteDefendingLlms: PageDef = {
  file: 'note-defending-llms',
  title: 'Defending LLMs — Alex Gaffen',
  viewport: 'width=device-width, initial-scale=1.0',
  fonts: ['inter-latin-wght-normal.woff2', 'space-mono-latin-400-normal.woff2', 'space-mono-latin-700-normal.woff2'],
  bodyClassName: notesBody,
  analytics: true,
  reveal: true,
  head: {
    fullIcons: true,
    description:
      'The common criticisms of LLMs — data hunger, unreliability, agentic risk, and sycophancy — measured against the human baseline they are implicitly compared to.',
    keywords: 'LLM criticism, AI reliability, hallucination rate, AGI, scaling laws, Alex Gaffen',
    author: 'Alex Gaffen',
    // Unpublished: unlisted from notes.html and the sitemap, and noindex'd here
    // so it doesn't turn up in search either.
    robots: 'noindex, nofollow',
    og: {
      title: 'Defending LLMs — Alex Gaffen',
      description: 'The common criticisms of LLMs measured against the human baseline they are implicitly compared to.',
      type: 'article',
      publishedTime: '2026-08-26',
      url: 'https://alexgaffen.com/note-defending-llms.html',
      image: 'https://alexgaffen.com/assets/frontheadshot.jpg',
    },
    twitter: {
      title: 'Defending LLMs — Alex Gaffen',
      description: 'The common criticisms of LLMs measured against the human baseline they are implicitly compared to.',
      image: 'https://alexgaffen.com/assets/frontheadshot.jpg',
    },
    canonical: 'https://alexgaffen.com/note-defending-llms.html',
    themeColor: '#0d0d0d',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: 'Defending LLMs',
      datePublished: '2026-08-26',
      url: 'https://alexgaffen.com/note-defending-llms.html',
      author: { '@type': 'Person', name: 'Alex Gaffen', url: 'https://alexgaffen.com/' },
    },
  },
  Body,
};
