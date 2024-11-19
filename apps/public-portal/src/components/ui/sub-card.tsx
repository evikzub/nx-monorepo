import React from "react";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import SortableItem from "./sortable-item";
import { SubCardProps } from "./sortable-list";

const SubCard: React.FC<SubCardProps> = ({
  id,
  title,
  answers,
  onDragEnd,
  isFocused,
  onFocus,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  return (
    <div
      //className={`rounded-xl bg-gray-50 p-5 shadow-md dark:bg-gray-900 ${isFocused ? "ring-2 ring-blue-500" : ""} flex h-full flex-col transition-shadow hover:shadow-lg`}
      className={`rounded-lg bg-gray-50 p-1 shadow-sm ${isFocused ? "ring-2 ring-blue-500" : ""} flex h-full flex-col`}
      onFocus={onFocus}
      tabIndex={0}
    >
      <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
        <span className="mr-2 inline-block rounded-full bg-red-200 px-2 py-1 text-xs font-bold text-white">
          {id}
        </span>
        {title}
      </h3>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext items={answers} strategy={verticalListSortingStrategy}>
          <div>
            {answers.map((item) => (
              <SortableItem key={item.id} item={item} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default SubCard;
