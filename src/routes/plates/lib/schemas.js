

import { z } from 'zod';

export const WellSchema = z.object({
  reagent: z.string().regex(/^R\d+$/, "Reagent must start with 'R' followed by numbers"),
  antibody: z.string().regex(/^[a-zA-Z]{20,40}$/, "Antibody must be a sequence of 20 to 40 letters").optional(),
  concentration: z.number().refine(value => value >= 0 && value <= 1, {
    message: "Concentration must be a floating point number between 0 and 1",
  }).optional(),
})
  .refine(data => data.antibody ? data.concentration !== undefined : true, {
    message: "Concentration is required when antibody is provided",
  })
  .refine(data => data.concentration !== undefined ? data.antibody !== undefined : true, {
    message: "Antibody is required when concentration is provided",
  });