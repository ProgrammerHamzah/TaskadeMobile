const {ApolloServer,gql}=require('apollo-server')
const {MongoClient}=require('mongodb')
const {ObjectId}=require('mongodb')
const dotenv=require('dotenv')
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')
dotenv.config()

const {DB_URI,DB_NAME,JWT_SECRET}=process.env
const getToken=(user)=>jwt.sign({id:user._id},JWT_SECRET,{expiresIn:'7 days'})
const getUserFromToken=async(token, db)=>{
    if(!token){
        console.log('no token provided')
        return null
    }
    const tokenData=jwt.verify(token,JWT_SECRET)
    console.log(tokenData)
    if(!tokenData?.id){return null}
    return await db.collection('Users').findOne({_id:new ObjectId(tokenData.id)})
}

const typeDefs=gql`
type Query{
    myTaskLists:[TaskList!]!
    getTaskList(id:ID!):TaskList
}
type Mutation{
    signUp(input:SignUpInput!):AuthUser!
    signIn(input:SignInInput!):AuthUser!
    createTaskList(title:String!):TaskList!
    updateTaskList(id:ID!,title:String!):TaskList!
    deleteTaskList(id:ID!):Boolean
    addUserToTaskList(taskListId:ID!, userId:ID!):TaskList
    createToDo(content:String!,taskListId:ID!):ToDo!
    updateToDo(id:ID!,content:String,isCompleted:Boolean):ToDo!
    deleteToDo(id:ID!):Boolean
}
input SignUpInput{
    email:String!
    password:String!
    name:String!
    avatar:String
}
input SignInInput{
    email:String!
    password:String!
}
type AuthUser{
    user:User!
    token:String!
}
type User{
    id:ID!
    name:String!
    email:String!
    avatar:String
}
type TaskList{
    id:ID!
    createdAt:String!
    title:String!
    progress:Float!

    users:[User!]!
    todos:[ToDo!]!
}
type ToDo{
    id:ID!
    content:String!
    isCompleted:Boolean!
    taskList:TaskList
}
`

const resolvers={
    Query:{
        myTaskLists:async(_,__,{db,user})=>{
            if(!user){
                throw new Error('User Invalid')
            }
            return await db.collection('TaskList').find({userIds:user._id}).toArray()
        },
        getTaskList: async (_, { id }, { db, user }) => {
            if (!user) {
                throw new Error('Authentication Error');
            }
            return await db.collection('TaskList').findOne({ _id: new ObjectId(id) });
        }
    },
    Mutation:{
        signUp:async(_, {input},{db} )=>{
            const hashedPassword = bcrypt.hashSync(input.password);
            const newUser = {
                ...input,
                password: hashedPassword
            };

            try {
                // Save to the database
                const result = await db.collection('Users').insertOne(newUser);
                console.log(result);
            
                if (result && result.insertedId) {
                    const user = await db.collection('Users').findOne({ _id: result.insertedId });
                    return {
                        user,
                        token: getToken(user)
                    };
                } else {
                    throw new Error('Unable to retrieve user data after insertion');
                }
            } catch (error) {
                console.error('Error signing up:', error);
                throw error;
            }            
            
        },
        signIn:async(_,{input},{db})=>{
            const user=await db.collection('Users').findOne({email:input.email})
            //check if password is correct
            const isPasswordCorrect=user && bcrypt.compareSync(input.password, user?.password)
            if(!user){
                throw new Error('User Invalid')
            }
            if(!isPasswordCorrect){
                throw new Error('Password Invalid')
            }
            return{
                user,
                token:getToken(user)
            }
        },
        createTaskList: async (_, { title }, { db, user }) => {
            if (!user) {
                throw new Error('Authentication Error');
            }
            const newTaskList = {
                title,
                createdAt: new Date().toISOString(),
                userIds: [user._id]
            };
        
            try {
                const result = await db.collection('TaskList').insertOne(newTaskList);
                if (result && result.insertedId) {
                    const insertedTaskList = await db.collection('TaskList').findOne({ _id: result.insertedId });
                    return insertedTaskList;
                } else {
                    throw new Error('TaskList insertion failed');
                }
            } catch (error) {
                console.error('Error creating task list:', error);
                throw error;
            }
        },
        updateTaskList: async (_, { id, title }, { db, user }) => {
            if (!user) {
                throw new Error('Authentication Error');
            }
            try {
                const result = await db.collection('TaskList').updateOne(
                    { _id: new ObjectId(id) },
                    {
                        $set: {
                            title: title
                        }
                    }
                );
                if (result.modifiedCount === 1) {
                    return await db.collection('TaskList').findOne({ _id: new ObjectId(id) });
                } else {
                    throw new Error('Failed to update task list');
                }
            } catch (error) {
                console.error('Error updating task list:', error);
                throw error;
            }
        },
        addUserToTaskList: async (_, { taskListId, userId }, { db, user }) => {
            if (!user) {
                throw new Error('Authentication Error');
            }
            try {
                const taskList = await db.collection('TaskList').findOne({ _id: new ObjectId(taskListId) });
                if (!taskList) {
                    return null;
                }
                if (taskList.userIds.find((dbId) => dbId.toString() === userId.toString())) {
                    return taskList;
                }
                const result = await db.collection('TaskList').updateOne(
                    { _id: new ObjectId(taskListId) },
                    {
                        $push: {
                            userIds: new ObjectId(userId)
                        }
                    }
                );
                taskList.userIds.push(new ObjectId(userId));
                return taskList;
            } catch (error) {
                console.error('Error adding user to task list:', error);
                throw error;
            }
        },
        deleteTaskList: async (_, { id }, { db, user }) => {
            if (!user) {
                throw new Error('Authentication Error');
            }
            await db.collection('TaskList').deleteOne({ _id: new ObjectId(id) });
            return true;
        },
        createToDo: async (_, { content, taskListId }, { db, user }) => {
            // Validate user authentication
            if (!user) {
                throw new Error('Authentication Error');
            }
        
            try {
                // Create a new ToDo item in the database
                const newToDo = {
                    content,
                    taskListId: new ObjectId(taskListId),
                    isCompleted: false
                };
        
                const result = await db.collection('ToDo').insertOne(newToDo);
        
                // Check if the insertion was successful
                if (result && result.insertedId) {
                    // Convert the inserted ID to an ObjectId
                    const insertedId = new ObjectId(result.insertedId);
        
                    // Fetch the newly inserted ToDo item
                    const insertedToDo = await db.collection('ToDo').findOne({ _id: insertedId });
        
                    // Return the newly inserted ToDo item
                    return insertedToDo;
                } else {
                    throw new Error('Failed to create ToDo');
                }
            } catch (error) {
                console.error('Error creating ToDo:', error);
                throw error;
            }
        },
        updateToDo: async (_, data, { db, user }) => {
            if (!user) {
                throw new Error('Authentication Error');
            }
            try {
                console.log('Data:', data); // Log the data object
                const result = await db.collection('ToDo').updateOne(
                    { _id: new ObjectId(data.id) },
                    {
                        $set: data
                    }
                );
                if (result.modifiedCount === 1) {
                    return await db.collection('ToDo').findOne({ _id: new ObjectId(data.id) });
                } else {
                    throw new Error('Failed to update todo');
                }
            } catch (error) {
                console.error('Error updating todo:', error);
                throw new Error('Failed to update todo');
            }
        },
        deleteToDo: async (_, { id }, { db, user }) => {
            if (!user) {
                throw new Error('Authentication Error');
            }
            await db.collection('ToDo').deleteOne({ _id: new ObjectId(id) });
            return true;
        }        
        
    },
    User:{
        id:({_id,id})=>_id||id
    },
    TaskList:{
        id:({_id,id})=>_id||id,
        progress:async({_id},_,{db})=>{
            const todos= await db.collection('ToDo').find({taskListId:new ObjectId(_id)}).toArray()
            const completed=todos.filter(todo=>todo.isCompleted)
            if(todos.length===0){
                return 0
            }
            return 100 * completed.length/todos.length
        },
        users:async({userIds},_,{db})=>Promise.all(userIds.map((userId)=> (
            db.collection('Users').findOne({_id:userId}))
        )
        ),
        todos:async({_id},_,{db})=>(
            await db.collection('ToDo').find({taskListId:new ObjectId(_id)}).toArray()
        ),
    },
    ToDo: {
        id: ({ _id, id }) => _id ? _id.toString() : id,
        taskList: async ({ taskListId }, _, { db }) => {
            if (!taskListId) {
                return null; // Return null if taskListId is not available
            }
            return await db.collection('TaskList').findOne({ _id: new ObjectId(taskListId) });
        }
    }
    
}

const start=async()=>{
    const client=new MongoClient(DB_URI,{useNewUrlParser:true,useUnifiedTopology:true})
    await client.connect()
    const db=client.db(DB_NAME)
    const context={
        db,
    }
    const server=new ApolloServer({
        typeDefs,
        resolvers,
        introspection: true,
        context:async({req})=>{
            //console.log(req.headers)
            const user=await getUserFromToken(req.headers.authorization,db)
            console.log(user)
            return{
                db,
                user
            }
        }
    })
    server.listen().then(({url})=>{
        console.log(`🚀  Server ready at: ${url}`)
    })
}
start()