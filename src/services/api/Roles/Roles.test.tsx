import { renderHook } from "@testing-library/react-hooks";
import { expect } from "chai";

import { wrapper } from "../restBuilder/restBuilder.test";
import { loadFixtures, clearFixtures } from "../../../mocks";
import { roles as rolesFixture } from "../../../mocks/roles/fixtures";

import { useRoles, useRole, useRoleMutations } from "./Roles";

describe("Services/API/Roles", () => {
  beforeEach(async () => loadFixtures());
  afterEach(async () => clearFixtures());

  describe("useRole", () => {
    it("makes the right request", async () => {
      const expected = rolesFixture[2];
      const { result, waitForNextUpdate } = renderHook(
        () => useRole(expected.id),
        { wrapper },
      );

      expect(result.current).to.equal(undefined);

      await waitForNextUpdate();

      // TODO: use serializer
      expect(result.current).to.have.property("id", expected.id);
      expect(result.current).to.have.property("startDate").that.is.a("date");
      expect(result.current).to.have.property(
        "startConfidence",
        expected.attributes.start_confidence,
      );
      expect(result.current).to.have.property("endDate").that.is.a("date");
      expect(result.current).to.have.property(
        "endConfidence",
        expected.attributes.end_confidence,
      );
    });
  });

  describe("useRoles", () => {
    it("makes the right request", async () => {
      const { result, waitForNextUpdate } = renderHook(() => useRoles(), {
        wrapper,
      });

      expect(result.current).to.equal(undefined);

      await waitForNextUpdate();

      // TODO: use serializer
      for (let i = 0; i < result.current.length; i++) {
        const expected = rolesFixture[i];

        expect(result.current[i]).to.have.property("id", expected.id);
        expect(result.current[i])
          .to.have.property("startDate")
          .that.is.a("date");
        expect(result.current[i]).to.have.property(
          "startConfidence",
          expected.attributes.start_confidence,
        );
        expect(result.current[i]).to.have.property("endDate").that.is.a("date");
        expect(result.current[i]).to.have.property(
          "endConfidence",
          expected.attributes.end_confidence,
        );
      }
    });
  });

  describe("useRoleMutations", () => {
    it("provides the mutations", async () => {
      const { result } = renderHook(() => useRoleMutations(), {
        wrapper,
      });

      expect(result.current)
        .to.have.property("createRole")
        .that.is.a("function");
      expect(result.current)
        .to.have.property("updateRole")
        .that.is.a("function");
      expect(result.current)
        .to.have.property("destroyRole")
        .that.is.a("function");
    });
  });
});
