import type { Socket } from "socket.io";
import { notification } from "../logger/LoggingSystem";
import { LogLevel } from "../logger/Observer";
import { ListEvent } from "../common/enums";
import { List } from "../data/models/list";
import { SocketHandler } from "./socket.handler";

export class ListHandler extends SocketHandler {
  public handleConnection(socket: Socket): void {
    socket.on(ListEvent.CREATE, this.createList.bind(this));
    socket.on(ListEvent.GET, this.getLists.bind(this));
    socket.on(ListEvent.REORDER, this.reorderLists.bind(this));
    socket.on(ListEvent.RENAME, this.changeTitleList.bind(this));
    socket.on(ListEvent.DELETE, this.deleteList.bind(this));
  }

  private getLists(callback: (cards: List[]) => void): void {
    try {
      callback(this.db.getData());
      notification.log(LogLevel.Info, `Cards fetched!.`);
    } catch (error) {
      notification.log(LogLevel.Error, error.message);
    }
  }

  private reorderLists(sourceIndex: number, destinationIndex: number): void {
    try {
      const lists = this.db.getData();
      const reorderedLists = this.reorderService.reorder(
        lists,
        sourceIndex,
        destinationIndex,
      );
      this.db.setData(reorderedLists);
      this.updateLists();
      notification.log(LogLevel.Info, `Lists reordered`);
    } catch (error) {
      notification.log(LogLevel.Error, error.message);
    }
  }

  private createList(name: string): void {
    try {
      const lists = this.db.getData();
      const newList = new List(name);
      this.db.setData(lists.concat(newList));
      this.updateLists();
      notification.log(LogLevel.Info, `List "${name}" created.`);
    } catch (error) {
      notification.log(LogLevel.Error, error.message);
    }
  }

  private changeTitleList(listId: string, value: string): void {
    try {
      const lists = this.db.getData();
      const newLists = [...lists];
      const listIndex = newLists.findIndex((list) => list.id === listId);
      newLists[listIndex].name = value;
      this.db.setData(newLists);
      this.updateLists();
      notification.log(
        LogLevel.Info,
        `Title of List "${listId}" was changed to "${value}".`,
      );
    } catch (error) {
      notification.log(LogLevel.Error, error.message);
    }
  }

  private deleteList(listId: string): void {
    try {
      const lists = this.db.getData();
      const newLists = lists.filter((list) => list.id !== listId);
      this.db.setData(newLists);
      this.updateLists();
      notification.log(LogLevel.Info, `List "${listId}" deleted.`);
    } catch (error) {
      notification.log(LogLevel.Error, error.message);
    }
  }
}
