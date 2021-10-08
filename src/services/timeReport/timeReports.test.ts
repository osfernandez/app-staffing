import { ColumnType, getTimeColumns } from "./timesReport";

describe("time report time scale logic", () => {


  const JAN_FOURTH = new Date(2021, 0, 4);
  it("returns first three weeks in Jan", () => {
    const columns = getTimeColumns(JAN_FOURTH);

    expect(columns[0].startDate.getMonth()).toBe(0);
    expect(columns[0].startDate.getDate()).toBe(4);

    expect(columns[1].startDate.getMonth()).toBe(0);
    expect(columns[1].startDate.getDate()).toBe(11);

    expect(columns[2].startDate.getMonth()).toBe(0);
    expect(columns[2].startDate.getDate()).toBe(18);
  });

  const THIRD_WEEK_IN_JAN = new Date(2021, 0, 18);
  it("return at least 2 weeks in month", () => {
    const columns = getTimeColumns(THIRD_WEEK_IN_JAN);

    console.log(columns);

    expect(columns[2].startDate.getMonth()).toBe(1);
    expect(columns[2].startDate.getDate()).toBe(1);

    expect(columns[3].startDate.getMonth()).toBe(1);
    expect(columns[3].startDate.getDate()).toBe(8);
  });


  // const THIRD_WEEK_IN_JAN = new Date(2021, 0, 18);
  it("return 2 months", () => {
    const columns = getTimeColumns(JAN_FOURTH);

    console.log(columns);

    expect(columns[3].startDate.getMonth()).toBe(1);
    expect(columns[3].columnType).toBe(ColumnType.month);
    expect(columns[4].startDate.getMonth()).toBe(2);
    expect(columns[4].columnType).toBe(ColumnType.month);
  });


  it("return next quarter following months", () => {
    const columns = getTimeColumns(JAN_FOURTH);

    console.log(columns);

    expect(columns[5].startDate.getMonth()).toBe(3);
    expect(columns[5].columnType).toBe(ColumnType.quarter);
  });


});
