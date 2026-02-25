import { describe, it, expect, beforeEach } from "vitest";
import { detectTimelock } from "../src/authority/timelock";
import { createMockClient, resetMockClient, testAddress } from "./testHelpers";

describe("Timelock Detection", () => {
  const mock = createMockClient();

  beforeEach(() => {
    resetMockClient(mock);
  });

  it("should detect Timelock with minDelay", async () => {
    const timelockAddress = testAddress(1);
    const minDelay = 86400n; // 1 day in seconds

    mock.readContract.mockResolvedValueOnce(minDelay);

    const result = await detectTimelock(mock.client, timelockAddress);

    expect(result.isTimelock).toBe(true);
    expect(result.minDelay).toBe(minDelay);
  });

  it("should return not a Timelock when getMinDelay reverts", async () => {
    const timelockAddress = testAddress(1);

    mock.readContract.mockRejectedValueOnce(new Error("revert"));

    const result = await detectTimelock(mock.client, timelockAddress);

    expect(result.isTimelock).toBe(false);
    expect(result.minDelay).toBeUndefined();
  });

  it("should return not a Timelock when getMinDelay returns wrong type", async () => {
    const timelockAddress = testAddress(1);

    mock.readContract.mockResolvedValueOnce("invalid" as unknown as bigint);

    const result = await detectTimelock(mock.client, timelockAddress);

    expect(result.isTimelock).toBe(false);
  });
});
