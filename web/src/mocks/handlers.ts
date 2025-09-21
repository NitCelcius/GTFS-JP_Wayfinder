import { http, HttpResponse } from "msw";
import { createMockFare } from "./factories";

export const handlers = [
  http.get("*/trips/fare", () => {
    const fareResponse = createMockFare();
    return HttpResponse.json(fareResponse);
  }),
];
