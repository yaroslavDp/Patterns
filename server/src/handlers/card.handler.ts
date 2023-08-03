import type { Socket } from "socket.io";
import { notification } from "../logger/LoggingSystem";
import { LogLevel } from "../logger/Observer";
import { CardEvent } from "../common/enums";
import { Card } from "../data/models/card";
import { SocketHandler } from "./socket.handler";

interface changeCardProps {
  listId: string;
  cardId: string;
  prop: "name" | "description";
  value: string;
}
interface CardProps {
  listId: string;
  cardId: string;
}
export class CardHandler extends SocketHandler {
  public handleConnection(socket: Socket): void {
    socket.on(CardEvent.CREATE, this.createCard.bind(this));
    socket.on(CardEvent.REORDER, this.reorderCards.bind(this));
    socket.on(CardEvent.RENAME, this.changeCard.bind(this));
    socket.on(CardEvent.CHANGE_DESCRIPTION, this.changeCard.bind(this));
    socket.on(CardEvent.DELETE, this.deleteCard.bind(this));
    socket.on(CardEvent.DUPLICATE, this.duplicateCard.bind(this));
  }

  public createCard(listId: string, cardName: string): void {
    try {
      const newCard = new Card(cardName, "");
      const lists = this.db.getData();

      const updatedLists = lists.map((list) =>
        list.id === listId ? list.setCards(list.cards.concat(newCard)) : list,
      );

      this.db.setData(updatedLists);
      this.updateLists();
      notification.log(
        LogLevel.Info,
        `Card "${cardName}" created in list "${listId}".`,
      );
    } catch (error) {
      notification.log(LogLevel.Error, error.message);
    }
  }

  public changeCard({ listId, cardId, prop, value }: changeCardProps) {
    try {
      const lists = this.db.getData();
      const listCopy = [...lists];

      const newLists = listCopy.map((list) => {
        if (list.id === listId) {
          const cardIndex = this.getCardIndex(list.cards, cardId);
          list.cards[cardIndex][prop] = value;
          return list;
        }
        return list;
      });

      this.db.setData(newLists);
      this.updateLists();
      notification.log(
        LogLevel.Info,
        `Property - ${prop} of "${cardId}" card was modified in list "${listId}" with value "${value}".`,
      );
    } catch (error) {
      notification.log(LogLevel.Error, error.message);
    }
  }
  public deleteCard({ listId, cardId }: CardProps) {
    try {
      const lists = this.db.getData();
      const listCopy = [...lists];

      const newLists = listCopy.map((list) => {
        if (list.id === listId) {
          const cardIndex = this.getCardIndex(list.cards, cardId);
          list.cards.splice(cardIndex, 1);
          return list;
        }
        return list;
      });

      this.db.setData(newLists);
      this.updateLists();
      notification.log(
        LogLevel.Info,
        `Card "${cardId}" deleted in list "${listId}".`,
      );
    } catch (error) {
      notification.log(LogLevel.Error, error.message);
    }
  }

  public duplicateCard({ listId, cardId }: CardProps) {
    try {
      const lists = this.db.getData();
      const listCopy = [...lists];

      const newLists = listCopy.map((list) => {
        if (list.id === listId) {
          const cardIndex = this.getCardIndex(list.cards, cardId);
          const duplicatedCard = list.cards[cardIndex].clone();
          list.cards.splice(cardIndex + 1, 0, duplicatedCard);
          return list;
        }
        return list;
      });
      this.db.setData(newLists);
      this.updateLists();
      notification.log(
        LogLevel.Info,
        `Card "${cardId}" duplicated in list "${listId}".`,
      );
    } catch (error) {
      notification.log(LogLevel.Error, error.message);
    }
  }

  private getCardIndex(cards: Card[], cardId: string) {
    return cards.findIndex((card) => card.id === cardId);
  }
  private reorderCards({
    sourceIndex,
    destinationIndex,
    sourceListId,
    destinationListId,
  }: {
    sourceIndex: number;
    destinationIndex: number;
    sourceListId: string;
    destinationListId: string;
  }): void {
    try {
      const lists = this.db.getData();
      const reordered = this.reorderService.reorderCards({
        lists,
        sourceIndex,
        destinationIndex,
        sourceListId,
        destinationListId,
      });
      this.db.setData(reordered);
      this.updateLists();
      notification.log(LogLevel.Info, `Cards reordered`);
    } catch (error) {
      notification.log(LogLevel.Error, error.message);
    }
  }
}
