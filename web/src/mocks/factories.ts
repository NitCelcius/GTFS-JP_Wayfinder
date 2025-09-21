import { faker } from "@faker-js/faker";
import type { FareResponse } from "@/api/types.gen";

export const createMockFare = (
  overrides: Partial<FareResponse> = {}
): FareResponse => ({
  fare: faker.number.int({ min: 100, max: 500 }),
  ...overrides,
});
