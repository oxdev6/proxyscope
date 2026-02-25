import { describe, it, expect, beforeEach } from "vitest";
import { detectGnosisSafe } from "../src/authority/gnosisSafe";
import { createMockClient, resetMockClient, testAddress } from "./testHelpers";

describe("Gnosis Safe Detection", () => {
  const mock = createMockClient();

  beforeEach(() => {
    resetMockClient(mock);
  });

  it("should detect Gnosis Safe with owners and threshold", async () => {
    const safeAddress = testAddress(1);
    const owners = [testAddress(10), testAddress(11), testAddress(12)] as Address[];
    const threshold = 2n;

    mock.readContract
      .mockResolvedValueOnce(owners)
      .mockResolvedValueOnce(threshold);

    const result = await detectGnosisSafe(mock.client, safeAddress);

    expect(result.isSafe).toBe(true);
    expect(result.owners).toEqual(owners);
    expect(result.threshold).toBe(threshold);
  });

  it("should return not a Safe when getOwners reverts", async () => {
    const safeAddress = testAddress(1);

    mock.readContract.mockRejectedValueOnce(new Error("revert"));

    const result = await detectGnosisSafe(mock.client, safeAddress);

    expect(result.isSafe).toBe(false);
    expect(result.owners).toBeUndefined();
    expect(result.threshold).toBeUndefined();
  });

  it("should return not a Safe when getThreshold returns wrong type", async () => {
    const safeAddress = testAddress(1);
    const owners = [testAddress(10)] as Address[];

    mock.readContract
      .mockResolvedValueOnce(owners)
      .mockResolvedValueOnce("invalid" as unknown as bigint);

    const result = await detectGnosisSafe(mock.client, safeAddress);

    expect(result.isSafe).toBe(false);
  });
});
