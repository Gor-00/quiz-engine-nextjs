import { AdSlot } from "./AdSlot";

type InlineAdProps = {
  afterQuestion: number;
};

export function InlineAd({ afterQuestion }: InlineAdProps) {
  return (
    <div aria-label={`Ad after question ${afterQuestion}`}>
      <AdSlot position="inline" />
    </div>
  );
}

