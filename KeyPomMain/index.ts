import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { addKey } from "../utils/keypom";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');
    const drop = (req.query.dropId || (req.body && req.body.dropId));

    // Check if dropId exists
    if (!drop) {
        context.res = {
            status: 400, // Bad Request
            body: "dropId does not exist in the request."
        };
        return; // Stop execution if no dropId
    }

    const result = await addKey(drop);

    // Check if result contains an error
    if ((typeof result === 'object' && 'error' in result) ) {
        context.res = {
            status: 500, // Internal Server Error
            body: result.error // Send the error message to the client
        };
    } else {
        // If no error, proceed with redirect
        context.res = {
            status: 302,
            headers: {
                'Location': result
            },
            body: 'Trial URL was generated succesfully.'
        };
    };

};

export default httpTrigger;