import { Client, Account, Databases, Storage, Avatars } from 'appwrite';
import { ID, Query } from 'appwrite'

const client = new Client();

client
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT) 
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID); 

const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);
const avatars = new Avatars(client);

export { client, account, databases, storage, avatars, ID, Query };
