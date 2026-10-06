import { listing } from "@/data/listing";
import { SectionSandbox } from "../_components/SectionSandbox";
import { SleepingSection } from "@/components/listing/sections/SleepingSection";
import { AmenitiesSection } from "@/components/listing/sections/AmenitiesSection";

// top = css px of the "Where you'll sleep" divider in the reference.
export default function Page() {
  return (
    <SectionSandbox top={1447.6} layout="left">
      <SleepingSection areas={listing.sleeping} />
      <AmenitiesSection amenities={listing.amenities} id="amenities" />
    </SectionSandbox>
  );
}
