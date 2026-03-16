"use client";

type ShareButtonsProps = {
  url: string;
  title: string;
};

export function ShareButtons({ url, title }: ShareButtonsProps) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;

  return (
    <div className="mt-4 flex flex-wrap gap-3">
      <a
        href={facebookUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex flex-1 items-center justify-center rounded-full bg-[#1877F2] px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-[#1454b5] sm:flex-none sm:px-6"
      >
        Share on Facebook
      </a>
      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex flex-1 items-center justify-center rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-sky-400 sm:flex-none sm:px-6"
      >
        Share on Twitter
      </a>
    </div>
  );
}

