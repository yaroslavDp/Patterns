import { createServer } from "http";
import { Server, Socket } from "socket.io";

import { lists } from "./assets/mockData";
import { Database } from "./data/database";
import { CardHandler } from "./handlers/card.handler";
import { ListHandler } from "./handlers/list.handler";
import { ReorderService } from "./services/reorder.service";
import { ReorderServiceProxy } from "./services/reorder.service";

const PORT = 3001;

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const db = Database.Instance;
const reorderService = new ReorderServiceProxy(new ReorderService());

if (process.env.NODE_ENV !== "production") {
  db.setData(lists);
}

const onConnection = (socket: Socket): void => {
  new ListHandler(io, db, reorderService).handleConnection(socket);
  new CardHandler(io, db, reorderService).handleConnection(socket);
};

io.on("connection", onConnection);

httpServer.listen(PORT, () => console.log("listening on port: " + PORT));

export { httpServer };
