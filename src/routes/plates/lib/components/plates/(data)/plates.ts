export interface Well {
  reagent: string;
  antibody: string;
  concentration: number;
}

export interface Plate {
  wells: { [wellId: string]: Well };
  meta: Record<string, unknown>;
}

export const plateSample: Plate = {
  wells: {
    "A1": {
      reagent: "R1111",
      antibody: "YYYAFAFFDGHIKLMNPQRSTVWYACDEFGHACDEFDFDF",
      concentration: 0.999,
    },
    "B2": {
      reagent: "R191429",
      antibody: "YYYAFAFFDGHIKLMNPQRSTVWYACDEFGHACDEFDFDF",
      concentration: 0.999,
    },
    "A2": {
      reagent: "R191429",
      antibody: "YYYAFAFFDGHIKLMNPQRSTVWYACDEFGHACDEFDFDF",
      concentration: 0.999,
    },
    "A3": {
      reagent: "R1234",
      antibody: "BBBACDEFGHIKLMNPQRSTVWYACDEFGHACDEFDFDF",
      concentration: 0.77777,
    },
    "D8": {
      reagent: "R1234",
      antibody: "BBBACDEFGHIKLMNPQRSTVWYACDEFGHACDEFDFDF",
      concentration: 0.25,
    }
  },
  meta: {
    name: "Sample Plate 1",
    id: "sample-plate-1",
    size: "96"
  }
};


export const plateNew: Plate = {
  wells: {
  },
  meta: {
    name: "New Plate",
    id: "my-new-plate",
    size: "96"
  }
};