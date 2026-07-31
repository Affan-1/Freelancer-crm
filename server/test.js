const { MongoClient } = require("mongodb");

const uri =
  "mongodb+srv://affanmuhammad926_db_user:Affan%4012345@cluster0.q4fuyx0.mongodb.net/freelancer-crm?retryWrites=true&w=majority";

async function test() {
  try {
    const client = new MongoClient(uri);

    await client.connect();

    console.log("✅ Connected Successfully");

    await client.close();
  } catch (err) {
    console.error(err);
  }
}

test();