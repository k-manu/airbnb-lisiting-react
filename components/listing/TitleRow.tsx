import { TitleActions } from "./TitleActions";

export function TitleRow({ title }: { title: string }) {
  return (
    <div className="flex items-start justify-between gap-4 pt-title-top pb-title-bottom">
      <h1
        id="listing-title"
        className="text-title leading-title font-medium text-ink"
      >
        {title}
      </h1>
      <TitleActions />
    </div>
  );
}
