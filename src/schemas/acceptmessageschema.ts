import {z} from 'zod';

export const acceptmessagesschema = z.object({
    acceptmessages : z.boolean(),
})