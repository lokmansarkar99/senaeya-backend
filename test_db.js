const mongoose = require('mongoose');

async function run() {
    await mongoose.connect('mongodb://senaeyaSuperAdmin:YourStrongPass123%21fkdkdkDKfk6@18.225.76.30:27017/senaeya?authSource=admin&replicaSet=rs0');
    console.log("Connected");
    const db = mongoose.connection.db;
    const works = await db.collection('works').find({}).limit(2).toArray();
    console.log("Works:", JSON.stringify(works, null, 2));
    
    if (works.length > 0 && works[0].workCategoryName) {
         const cat = await db.collection('workscategories').findOne({ _id: works[0].workCategoryName });
         console.log("Category:", cat);
    }
    process.exit(0);
}

run().catch(console.dir);
