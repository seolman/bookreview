import * as schema from "../src/db/schema.js";
import { pgGenerate } from "drizzle-dbml-generator";

const out = "./schema.dbml";
const relational = false;

pgGenerate({ schema, out, relational });
