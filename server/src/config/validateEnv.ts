import { cleanEnv } from "envalid";
import { str } from "envalid/dist/validators";

const env = cleanEnv(process.env, {
    MONGO_CONNECTION_STRING: str(),
})

export default env;