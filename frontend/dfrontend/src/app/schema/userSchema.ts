import * as z from 'zod'


const userSchema = z.object({
    name : z.string().min(1 , 'name is required').max(100),
    email:z.string().min(1 , 'Email is required').email('invalid email'),
    password : z.string().min(1 , 'password is required')
})

export {userSchema}