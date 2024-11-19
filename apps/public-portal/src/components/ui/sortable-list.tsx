"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

// Import icons
import { DragEndEvent, UniqueIdentifier } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import {
  ArrowLeft,
  ArrowLeftToLine,
  ArrowRight,
  ArrowRightToLine,
} from "lucide-react";

import { useAssessmentStore } from '@/store/assessment/slice'
import { QuestionsProps } from "@/types/questions";

import SubCard from "./sub-card";
import { ValuesProps } from "@entrepreneur/shared/types";
import { useToast } from "@entrepreneur/shared/ui";

interface SortableListProps {
  onSubmit: (data: ValuesProps) => Promise<void>
  initialCards: QuestionsProps[];
}

export interface SubCardProps extends QuestionsProps {
  onDragEnd: (event: DragEndEvent) => void;
  isFocused: boolean;
  onFocus: () => void;
}

const SortableList = ({ onSubmit, initialCards }: SortableListProps) => {
  const subPages = 6;
  const router = useRouter();
  const { toast } = useToast()

  const { assessment } = useAssessmentStore();

  const [subCards, setSubCards] = useState<QuestionsProps[]>(initialCards);
  const [focusedCardId, setFocusedCardId] = useState<number | null>(null);
  const [currentGroup, setCurrentGroup] = useState<number>(1); // Track the current group

  // Sort subCards based on the current group
  const filteredSubCards = subCards.filter(
    (card) => card.group === currentGroup
  );

  const updateSubCards = (
    subCardId: number,
    activeId: UniqueIdentifier,
    overId: UniqueIdentifier | undefined
  ) => {
    setSubCards((prevSubCards) => {
      return prevSubCards.map((subCard) => {
        if (subCard.id === subCardId) {
          const oldIndex = subCard.answers.findIndex(
            (item) => item.id === activeId
          );
          const newIndex = subCard.answers.findIndex(
            (item) => item.id === overId
          );
          if (oldIndex !== -1 && newIndex !== -1) {
            return {
              ...subCard,
              answers: arrayMove(subCard.answers, oldIndex, newIndex), // Ensure 'answers' is updated
            };
          }
        }
        return subCard;
      });
    });
  };

  const handleDragEnd = (event: DragEndEvent, subCardId: number) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      updateSubCards(subCardId, active.id, over?.id);
    }
  };

  const buildResults = async () => {
    try {
      const valuesResult = subCards.reduce(
        (acc, subCard) => {
        acc[subCard.id] = { answers: subCard.answers.map((item) => item.id) };
        return acc;
      },
      {} as Record<string, { answers: number[] }>
    );

    //console.log("Values:", valuesResult);
    //alert(JSON.stringify(valuesResult)); // Ensure the result is displayed correctly
    if (assessment?.id === null) {
      throw new Error("Assessment ID is null");
    }

    //console.log("buildResults -> call")
      await onSubmit(valuesResult)
  } catch (error) {
    console.log("error in buildResults: ", error)
    toast({
      variant: 'destructive',
      title: 'Error',
      description: error instanceof Error ? error.message : 'Failed to build results',
    })
  }
  };

  const checkAssessmentId = () => {
    if (assessment?.id === null) {
      //throw new Error("Assessment ID is null");
      console.log("Assessment ID is null");
      router.push("/");
      return false;
    }
    return true;
  };

  const handleContinue = () => {
    if (!checkAssessmentId()) return;
    if (currentGroup < subPages) {
      setCurrentGroup(prevGroup => prevGroup + 1);
    } else if (currentGroup === subPages) {
      // Only call buildResults when we're on the last page
      buildResults();
    }
  };

  const handleBack = () => {
    if (!checkAssessmentId()) {
      return;
    }
    if (currentGroup > 1) {
      setCurrentGroup(currentGroup - 1);
    }
  };

  return (
    <div className="mx-auto max-w-6xl rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800">
      <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white sm:text-2xl">
        Sorting By Importance
      </h1>
      <p className="mb-2 text-sm text-gray-600 dark:text-gray-400 sm:text-base">
        <b>{assessment?.firstName},</b> this section has 4 questions each with
        four options. Please click, drag and place in order from top to bottom
        (most important to least important) the options which best describe you.
      </p>
      <div className="mb-2 grid grid-cols-1 gap-2 md:grid-cols-2">
        {filteredSubCards.map((subCard) => (
          // <div key={subCard.id} className="min-h-[200px]">
          <SubCard
            key={subCard.id}
            id={subCard.id}
            title={subCard.title}
            answers={subCard.answers}
            group={subCard.group}
            onDragEnd={(event) => handleDragEnd(event, subCard.id)}
            //onDragEnd={handleDragEnd}
            isFocused={focusedCardId === subCard.id}
            onFocus={() => setFocusedCardId(subCard.id)}
          />
          // </div>
        ))}
      </div>
      <div className="flex justify-between">
        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-600 text-white shadow-md transition duration-300 hover:bg-gray-700"
          onClick={handleBack}
          disabled={currentGroup === 1} // Disable if on the first group
        >
          {currentGroup === 1 ? <ArrowLeftToLine /> : <ArrowLeft />}{" "}
          {/* Change icon based on group */}
        </button>
        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md transition duration-300 hover:bg-blue-700"
          onClick={handleContinue}
        >
          {currentGroup < subPages ? <ArrowRight /> : <ArrowRightToLine />}{" "}
          {/* Change icon based on group */}
        </button>
      </div>
    </div>
  );
};

export default SortableList;
