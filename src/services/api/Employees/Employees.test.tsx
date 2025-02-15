import { renderHook } from "@testing-library/react-hooks";
import { expect } from "chai";

import { wrapper } from "../restBuilder/restBuilder.test";
import { loadFixtures, clearFixtures } from "../../../mocks";
import { employees } from "../../../mocks/fixtures";

import { useEmployees, useEmployee, useEmployeeMutations } from "./Employees";

describe("Services/API/Employees", () => {
  beforeEach(async () => loadFixtures());
  afterEach(async () => clearFixtures());

  describe("useEmployee", () => {
    it("makes the right request", async () => {
      const expected = employees[2];
      const { result, waitForNextUpdate } = renderHook(
        () => useEmployee(expected.id),
        { wrapper },
      );

      expect(result.current).to.equal(undefined);

      await waitForNextUpdate();

      // TODO: use serializer
      expect(result.current).to.have.property("id", expected.id);
      expect(result.current).to.have.property("name", expected.name);
      expect(result.current).to.have.property("startDate").that.is.a("date");
      expect(result.current).to.have.property("endDate").that.is.a("date");
    });
  });

  describe("useEmployees", () => {
    it("makes the right request", async () => {
      const { result, waitForNextUpdate } = renderHook(() => useEmployees(), {
        wrapper,
      });

      expect(result.current).to.equal(undefined);

      await waitForNextUpdate();

      // TODO: use serializer
      for (let i = 0; i < result.current.length; i++) {
        const expected = employees[i];

        expect(result.current[i]).to.have.property("id", expected.id);
        expect(result.current[i]).to.have.property("name", expected.name);
        expect(result.current[i])
          .to.have.property("startDate")
          .that.is.a("date");
        expect(result.current[i]).to.have.property("endDate").that.is.a("date");
      }
    });
  });

  describe("useEmployeeMutations", () => {
    it("provides the mutations", async () => {
      const { result } = renderHook(() => useEmployeeMutations(), {
        wrapper,
      });

      expect(result.current)
        .to.have.property("createEmployee")
        .that.is.a("function");
      expect(result.current)
        .to.have.property("updateEmployee")
        .that.is.a("function");
      expect(result.current)
        .to.have.property("destroyEmployee")
        .that.is.a("function");
    });
  });
});
