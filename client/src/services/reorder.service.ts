import { cloneDeep, findIndex, remove } from "lodash";
import type { DraggableLocation } from "@hello-pangea/dnd";
import { Card, List } from "../common/types";

const removeCardFromList = (cards: Card[], index: number): Card[] => {
  const clonedCards = cloneDeep(cards);
  remove(clonedCards, (_, i) => i === index);
  return clonedCards;
};

const addCardToList = (cards: Card[], index: number, card: Card): Card[] => {
  const clonedCards = cloneDeep(cards);
  clonedCards.splice(index, 0, card);
  return clonedCards;
};

const reorderLists =
  (startIndex: number, endIndex: number) =>
  (items: List[]): List[] => {
    const clonedItems = cloneDeep(items);
    const [removed] = clonedItems.splice(startIndex, 1);
    clonedItems.splice(endIndex, 0, removed);
    return clonedItems;
  };
/// I tried to make one function for reorderLists and reorder but Typescript showed me an error -> "No overload matches this call."

const reorder =
  (startIndex: number, endIndex: number) =>
  (items: Card[]): Card[] => {
    const clonedItems = cloneDeep(items);
    const [removed] = clonedItems.splice(startIndex, 1);
    clonedItems.splice(endIndex, 0, removed);
    return clonedItems;
  };

const findListIndexById = (lists: List[], id: string): number =>
  findIndex(lists, (list) => list.id === id);

const reorderCards = (
  lists: List[],
  source: DraggableLocation,
  destination: DraggableLocation,
): List[] => {
  const sourceListIndex = findListIndexById(lists, source.droppableId);
  const destinationListIndex = findListIndexById(
    lists,
    destination.droppableId,
  );

  const currentCards: Card[] =
    sourceListIndex !== -1 ? cloneDeep(lists[sourceListIndex].cards) : [];
  const nextCards: Card[] =
    destinationListIndex !== -1
      ? cloneDeep(lists[destinationListIndex].cards)
      : [];

  const targetCard: Card = currentCards[source.index];

  if (sourceListIndex === destinationListIndex) {
    const reorderedCards = reorder(
      source.index,
      destination.index,
    )(currentCards);

    return lists.map((list, index) =>
      index === sourceListIndex ? { ...list, cards: reorderedCards } : list,
    );
  }

  const updatedLists = lists.map((list, index) => {
    if (index === sourceListIndex) {
      return { ...list, cards: removeCardFromList(currentCards, source.index) };
    }

    if (index === destinationListIndex) {
      return {
        ...list,
        cards: addCardToList(nextCards, destination.index, targetCard),
      };
    }

    return list;
  });

  return updatedLists;
};

export { reorderLists, reorderCards };
