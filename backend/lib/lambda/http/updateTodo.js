import 'source-map-support/register';
import * as middy from 'middy';
import { cors, httpErrorHandler } from 'middy/middlewares';
import { HEADERS } from "./statics";
import { updateTodo } from "../../helpers/todos";
export const handler = middy(async (event) => {
    const todoId = event.pathParameters.todoId;
    const updateData = JSON.parse(event.body);
    try {
        await updateTodo(event, todoId, updateData);
        return {
            statusCode: 204,
            headers: HEADERS,
            body: undefined
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
handler
    .use(httpErrorHandler())
    .use(cors({
    credentials: true
}));
//# sourceMappingURL=updateTodo.js.map