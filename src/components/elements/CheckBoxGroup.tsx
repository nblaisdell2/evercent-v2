import React, { useEffect, useState } from "react";
import { CheckIcon, MinusIcon } from "@heroicons/react/24/outline";

export type CheckboxItem = {
  parentId: string;
  id: string;
  name: string;
  selected?: boolean;
};

type Props = {
  items: CheckboxItem[];
  setItems: (newItems: CheckboxItem[]) => void;
};

function CheckBoxGroup({ items, setItems }: Props) {
  const [hoveredItems, setHoveredItems] = useState<string[]>([]);

  const getChildIDs = (item: CheckboxItem, includeSelf: boolean) => {
    let ids: string[] = [];

    for (let i = 0; i < items.length; i++) {
      if (items[i].parentId == item?.id) {
        ids = [...ids, items[i].id, ...getChildIDs(items[i], includeSelf)];
      }
    }

    if (includeSelf) return [...new Set([item.id, ...ids])];
    return [...new Set([...ids])];
  };

  //   const getMainParentID = (item: CheckboxItem) => {
  //     let currItem: CheckboxItem = item;
  //     // console.log("  currItem", currItem);
  //     while (currItem.parentId != "") {
  //       currItem = items.filter((itm) => {
  //         return itm.id == currItem.parentId;
  //       })[0];
  //       //   console.log("  currItem again", currItem);
  //     }
  //     // console.log("returning", currItem.parentId);
  //     return currItem.id == item.id ? "" : currItem.id;
  //   };

  const toggleSelected = (item: CheckboxItem, on: boolean, idx: number) => {
    let newItems = [...items];
    for (let i = 0; i < newItems.length; i++) {
      if (
        newItems[i].parentId == item.id ||
        (idx == 0 && newItems[i].id == item.id)
      ) {
        newItems[i].selected = on;
        newItems = toggleSelected(newItems[i], on, ++idx);
      }
    }

    return newItems;
  };

  const createInputRow = (
    item: CheckboxItem,
    indent: number,
    isGroup: boolean
  ) => {
    const LEFT_MARGIN_PIXELS = 25;

    const isDet =
      isGroup &&
      items
        .filter((itm) => {
          return (
            itm.parentId == item.id || getChildIDs(item, true).includes(itm.id)
          );
        })
        .some((itm) => {
          return itm.selected;
        });
    const isAll =
      isGroup &&
      items
        .filter((itm) => {
          return itm.parentId == item.id;
        })
        .every((itm) => {
          return itm.selected;
        });

    let parentIsHovered = hoveredItems.includes(item.id);

    return (
      <div
        style={{ paddingLeft: (LEFT_MARGIN_PIXELS * indent).toString() + "px" }}
        className={`cursor-pointer ${
          isGroup && "font-bold"
        } flex items-center group`}
        onClick={() => {
          let newItems = [...items];
          let toggle = !item.selected;

          // toggle ALL children AND parent if parent is toggled
          newItems
            .filter((itm) => {
              return (
                itm.id == item.id || getChildIDs(item, false).includes(itm.id)
              );
            })
            .map((itm) => {
              itm.selected = toggle;
            });

          // toggle parent if ALL children are selected
          newItems
            .filter((itm) => {
              return itm.id == item.parentId;
            })
            .map((itm) => {
              itm.selected = toggle;
            });

          //   onSave(
          //     newItems.filter((itm) => {
          //       return itm.parentId !== "";
          //     })
          //   );
          setItems(newItems);
        }}
        onMouseEnter={() => {
          setHoveredItems(getChildIDs(item, true));
        }}
        onMouseLeave={() => {
          setHoveredItems([]);
        }}
      >
        <div
          className={`flex justify-center items-center bg-blue-900 h-4 w-4 border border-gray-400 rounded-[4px] mr-1 ${
            item.selected || isDet
              ? "bg-opacity-100 text-white"
              : parentIsHovered
              ? "bg-opacity-50"
              : "bg-opacity-0"
          } ${
            item.selected
              ? "group-hover:bg-opacity-100"
              : "group-hover:bg-opacity-50"
          }`}
        >
          {isDet && !isAll && !parentIsHovered ? (
            <MinusIcon className={`h-4 w-4 text-white stroke-2`} />
          ) : (
            <CheckIcon className={`h-4 w-4 text-white stroke-2`} />
          )}
        </div>
        <span>
          {"  "}
          {item.name}
        </span>
      </div>
    );
  };

  const createItem = (item: CheckboxItem, indent: number) => {
    return (
      <ul key={item.id}>
        <li>{createInputRow(item, indent, false)}</li>
      </ul>
    );
  };

  const createGroup = (item: CheckboxItem, indent: number) => {
    const subItems = items.filter((sItem) => sItem.parentId == item.id);

    return (
      <ul key={item.id}>
        <li>
          {createInputRow(item, indent, true)}

          {subItems && (
            <>
              {subItems.map((subItem) => {
                indent += 1;

                let newItem: JSX.Element;
                let subSubItems = items.filter(
                  (sItem) => sItem.parentId == subItem.id
                );

                if (subSubItems.length > 0) {
                  newItem = createGroup(subItem, indent);
                } else {
                  newItem = createItem(subItem, indent);
                }

                indent -= 1;
                return newItem;
              })}
            </>
          )}
        </li>
      </ul>
    );
  };

  const startItems = items.filter((item) => item.parentId == "");

  return (
    <>
      {startItems?.map((item) => {
        return createGroup(item, 0);
      })}
    </>
  );
}

export default CheckBoxGroup;
