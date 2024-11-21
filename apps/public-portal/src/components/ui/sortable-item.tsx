import React from "react";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MoveVertical } from "lucide-react";
import { AnswerItemProps } from "@entrepreneur/shared/types";

//import { Item } from "./common";

const SortableItem: React.FC<{ item: AnswerItemProps }> = ({ item }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Use a stable ID for aria-describedby
  const ariaDescribedById = `DndDescribedBy-${item.id}`;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      aria-describedby={ariaDescribedById} // Ensure consistent ID
      className="mb-1 flex cursor-move items-center rounded border border-gray-200 bg-white p-2 text-sm shadow-sm"
    >
      <MoveVertical className="mr-2 h-3 w-3 flex-shrink-0 text-gray-400" />
      <span className="truncate text-gray-700 dark:text-gray-300">
        {item.name}
      </span>
    </div>
  );
};

export default SortableItem;
