/** One choice in the area picker: an area with the feeder and zone it belongs to. */
export type AreaOption = {
  id: string;
  name: string;
  feederName: string;
  zoneName: string;
};

/** Flattens a feeder list into the options the area picker takes. */
export const toAreaOptions = (
  feeders: {
    name: string;
    areas: { id: string; name: string }[];
    substation: { zone: { name: string } };
  }[],
): AreaOption[] =>
  feeders.flatMap((feeder) =>
    feeder.areas.map((area) => ({
      id: area.id,
      name: area.name,
      feederName: feeder.name,
      zoneName: feeder.substation.zone.name,
    })),
  );
