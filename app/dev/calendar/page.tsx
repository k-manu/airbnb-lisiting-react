import { listing } from "@/data/listing";
import { CalendarSection } from "@/components/listing/sections/CalendarSection";
import { SectionSandbox } from "../_components/SectionSandbox";

export default function Page() {
  return (
    <SectionSandbox top={2238} layout="left">
      <CalendarSection
        stay={listing.stay}
        calendar={listing.calendar}
        location={listing.summary.location}
      />
    </SectionSandbox>
  );
}
