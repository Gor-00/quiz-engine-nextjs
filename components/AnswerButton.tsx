"use client";

type AnswerButtonProps = {
  text: string;
  selected?: boolean;
  disabled?: boolean;
  onClick: () => void;
};

export function AnswerButton({
  text,
  selected,
  disabled,
  onClick
}: AnswerButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
        selected
          ? "border-indigo-500 bg-indigo-500/15 text-indigo-100"
          : "border-slate-700 bg-slate-900/60 text-slate-100 hover:border-indigo-500/60 hover:bg-slate-900"
      } ${disabled ? "opacity-70" : ""}`}
    >
      <span>{text}</span>
    </button>
  );
}

