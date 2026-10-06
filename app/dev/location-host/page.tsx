import { listing } from "@/data/listing";
import { MeetYourHostSection } from "@/components/listing/sections/host/MeetYourHostSection";
import { LocationSection } from "@/components/listing/sections/location/LocationSection";
import { SectionSandbox } from "../_components/SectionSandbox";

export default function Page() {
  return (
    <SectionSandbox top={4027} layout="full">
      <LocationSection
        id="location"
        location={listing.location}
        neighbourhood={listing.neighbourhood}
      />
      <MeetYourHostSection host={listing.host} />
    </SectionSandbox>
  );
}
