import { describe, it, expect, beforeEach } from "vitest";
import { detectProxy } from "../src/proxy/detectProxy";
import { createMockClient, resetMockClient, mockProxySlots, testAddress } from "./testHelpers";

describe("Proxy Detection", () => {
  const mock = createMockClient();

  beforeEach(() => {
    resetMockClient(mock);
  });

  it("should detect EIP-1967 proxy with implementation and admin", async () => {
    const proxyAddress = testAddress(1);
    const implAddress = testAddress(2);
    const adminAddress = testAddress(3);

    mockProxySlots(mock, proxyAddress, implAddress, adminAddress);

    const result = await detectProxy(mock.client, proxyAddress);

    expect(result.isProxy).toBe(true);
    expect(result.proxyType).toBe("EIP-1967");
    expect(result.implementationAddress?.toLowerCase()).toBe(implAddress.toLowerCase());
    expect(result.adminAddress?.toLowerCase()).toBe(adminAddress.toLowerCase());
  });

  it("should return not a proxy when implementation slot is empty", async () => {
    const proxyAddress = testAddress(1);

    mockProxySlots(mock, proxyAddress, null, null);

    const result = await detectProxy(mock.client, proxyAddress);

    expect(result.isProxy).toBe(false);
    expect(result.proxyType).toBe("None");
    expect(result.implementationAddress).toBeNull();
    expect(result.adminAddress).toBeNull();
  });

  it("should detect proxy even when admin slot is empty", async () => {
    const proxyAddress = testAddress(1);
    const implAddress = testAddress(2);

    mockProxySlots(mock, proxyAddress, implAddress, null);

    const result = await detectProxy(mock.client, proxyAddress);

    expect(result.isProxy).toBe(true);
    expect(result.proxyType).toBe("EIP-1967");
    expect(result.implementationAddress?.toLowerCase()).toBe(implAddress.toLowerCase());
    expect(result.adminAddress).toBeNull();
  });
});
