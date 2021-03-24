import Datastore from "lowdb";
import FileSync from "lowdb/adapters/FileSync";
import path from "path";

const adapter = new FileSync(path.join(__dirname, "/../main/localMusic.json"));

const db = Datastore(adapter);

export default db;
