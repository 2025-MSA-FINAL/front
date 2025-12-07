import React, { useState, useEffect } from "react";
import { DateRange } from "react-date-range";
import { ko } from "date-fns/locale";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

const DateRangePicker = ({ startDate, endDate, onChange }) => {
  const today = new Date();

  const [monthsToShow, setMonthsToShow] = useState(() => {
    if (typeof window === "undefined") return 2;
    return window.innerWidth < 768 ? 1 : 2; // 768px 미만이면 1개월
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setMonthsToShow(1);
      } else {
        setMonthsToShow(2);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);



  const selectionRange = {
    startDate: startDate ? new Date(startDate) : today,
    endDate: endDate
      ? new Date(endDate)
      : startDate
      ? new Date(startDate)
      : today,
    key: "selection",
  };

  const handleChange = (ranges) => {
    const { startDate: s, endDate: e } = ranges.selection;
    onChange({ startDate: s, endDate: e });
  };

  return (
    <div className="popup-date-range bg-paper rounded-[24px] shadow-card p-4">
      <DateRange
        ranges={[selectionRange]}
        onChange={handleChange}
        months={monthsToShow}
        direction="horizontal"
        locale={ko}
        showDateDisplay={false}
        editableDateInputs={false}
        moveRangeOnFirstSelection={false}
        showPreview={false}
        weekdayDisplayFormat="EE"  
        rangeColors={["var(--color-primary-light)"]}
      />
    </div>
  );
};

export default DateRangePicker;
