import { useEffect, useState } from "react";
import { CheckboxItem } from "../elements/HierarchyTable";

function useHierarchyTable(
  data: any,
  createListFn: (data: any) => CheckboxItem[]
) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [listData, setListData] = useState(createListFn(data));

  useEffect(() => {
    setListData((prev) => {
      console.log("expanded items");
      let newList = createListFn(data);
      for (let i = 0; i < newList.length; i++) {
        if (
          newList[i].parentId == "" &&
          expandedItems.includes(newList[i].id)
        ) {
          if (prev.find((p) => p.id == newList[i].id)?.expanded)
            newList[i].expanded = true;
        }
      }

      console.log("newList", newList);
      return newList;
    });
  }, [data]);

  return {
    listData,
    setListData,
    setExpandedItems,
  };
}

export default useHierarchyTable;
