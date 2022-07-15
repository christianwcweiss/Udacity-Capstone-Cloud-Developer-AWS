import 'source-map-support/register';
import * as middy from 'middy';
import { cors } from 'middy/middlewares';
import { getTodos } from "../../helpers/todos";
import { HEADERS } from "./statics";
export const handler = middy(async (event) => {
    try {
        const todoList = await getTodos(event);
        return {
            statusCode: 200,
            headers: HEADERS,
            body: JSON.stringify({ todoList })
        };
    }
    catch (error) {
        return {
            statusCode: 500,
            headers: HEADERS,
            body: JSON.stringify({ error })
        };
    }
});
handler.use(cors({
    credentials: true
}));
//# sourceMappingURL=getTodos.js.map