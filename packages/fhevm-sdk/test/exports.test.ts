import { describe, expect, it } from "vitest";
import * as main from "../src";
import * as core from "../src/core";
import * as react from "../src/react";
import * as storage from "../src/storage";

describe("exports", () => {
  it("main exports are present", () => {
    expect(main).toBeTruthy();
  });

  it("react exports are present", () => {
    expect(react).toBeTruthy();
  });

  it("core exports are present", () => {
    expect(core).toBeTruthy();
  });

  it("storage exports are present", () => {
    expect(storage).toBeTruthy();
  });
});
