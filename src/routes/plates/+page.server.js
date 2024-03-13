
import { getPlates } from '$routes/plates/lib'

export const load = (async () => {
  let plates = await getPlates()

  return {plates}
});

