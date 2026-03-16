"use client";

type ViralTitleProps = {
  main: string;
  kicker?: string;
};

export function ViralTitle({ main, kicker }: ViralTitleProps) {
  return (
    <div>
      {kicker ? (
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-fuchsia-400">
          {kicker}
        </p>
      ) : null}
      <h1 className="text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
        {main}
      </h1>
    </div>
  );
}

