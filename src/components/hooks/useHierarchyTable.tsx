import { useState } from "react";
import { CheckboxItem } from "../elements/HierarchyTable";

function useHierarchyTable(items: CheckboxItem[]) {
  const [listData, setListData] = useState(items);

  return {
    listData,
    setListData,
  };
}

export default useHierarchyTable;
