import { listing } from "@/data/listing";
import { NearbyStaysSection } from "@/components/listing/sections/nearby/NearbyStaysSection";
import { ThingsToKnowSection } from "@/components/listing/sections/things-to-know/ThingsToKnowSection";
import { SectionSandbox } from "../_components/SectionSandbox";

export default function Page() {
  return (
    <SectionSandbox top={5449} layout="full">
      <ThingsToKnowSection data={listing.thingsToKnow} />
      <NearbyStaysSection data={listing.nearby} />
    </SectionSandbox>
  );
}
