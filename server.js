require("dotenv").config();

const express = require('express')
const db = require("./db");

//-Way to create a user
//-Way to create an organisation
//-Way to add an user to the organisation
//-Way to update and delete the user
//Way to update/delete an organisation. (Validation: Cannot delete an organisation if there are user attached to it)
//Way to view the details of the user along with the organisation details the user belongs to.////////////


// -Endpoint to create a user with the mentioned details (Such as name, email, age, phone number(unique number)) and store it in a table using postgres.
// -Endpoint to update the user details (name, age and email).
// -Endpoint to delete a particular user by user Id.
// -Endpoint to create an organisation with the mentioned details (Such as name, gstin, location, brand, city, state)
// -Endpoint to update (name, location)/ delete an organisation (Validation: Cannot delete an organisation if there are users attached to it).
// -Endpoint to view the details of the user by userId along with the organisation details.


const app = express();


app.use(express.json());

app.get("/api/getallOrgs", async (req, res) => {

        try{
            console.log("Results : ");
             const results= await db.query('select * from  organization');
            console.log(results);
    

            res.status(200).json({
            status:"succes",
            No_of_rows: results.rows.length,
            data:{
                organisations: results.rows[0],
                },
            });
        }
        catch(err)
        {  console.log(err);

        }
});


//to create a user *
app.post('/api/AddUsers', async (req, res) => {
    try {
      const { name, age, email, phoneno, org_id } = req.body;
      const result = await db.query('INSERT INTO "user" (name, age, email, phoneno, org_id) VALUES ($1, $2, $3, $4, $5) RETURNING *', [req.body.name, req.body.age, req.body.email, req.body.phoneno, req.body.org_id]);
      res.json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error', });
    }
  });


// Endpoint to update user details*

app.put('/api/UpdateUsers/:userId', async (req, res) => {
    try {
             const userId = req.params.userId;
             const { name, age, email } = req.body;
            const result = await db.query('UPDATE "user" SET name = $1, age = $2, email = $3 WHERE user_id = $4 RETURNING *', [req.body.name, req.body.age, req.body.email, req.params.userId]);
             res.json(result.rows[0]);
    } 
    catch (error)
     {
        console.error(error);
         res.status(500).json({ error: 'Internal Server Error' });
    }
  });

// Endpoint to delete a user by user Id*
app.delete('/api/DeleteUsers/:userId', async (req, res) => {
    try {
          const userId = req.params.userId;
          const result = await db.query('DELETE FROM "user" WHERE user_id = $1 RETURNING *', [req.params.userId]);
           res.json(result.rows[0]);
    } 
    catch (error) 
      {
          console.error(error);
          res.status(500).json({ error: 'Internal Server Error' });
        }
  });


// Endpoint to create an organization*
app.post('/api/CreateOrg', async (req, res) => {
    try {
              const { name, gstin, location, brand, city, state } = req.body;
             const result = await db.query('INSERT INTO organization (name, gstin, location, brand, city, state) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [req.body.name, req.body.gstin, req.body.location, req.body.brand, req.body.city, req.body.state]);
             res.json(result.rows[0]);
         } 
    catch (error)
          {
              console.error(error);
             res.status(500).json({ error: 'Internal Server Error' });
            }
  });
  
  // Endpoint to update org details*
app.put('/api/UpdateOrgs/:orgId', async (req, res) => {
    try {
            const orgId = req.params.orgId;
             const { name, location, city, state } = req.body;
             const result = await db.query('UPDATE organization SET name = $1, location = $2, city = $3, state = $4 WHERE org_id = $5 RETURNING *', [req.body.name, req.body.location, req.body.city, req.body.state, req.params.orgId]);
            res.json(result.rows[0]);
         } 
         catch (error) 
         {
            console.error(error);
             res.status(500).json({ error: 'Internal Server Error' });
         }
  });

//delete an organization*
app.delete('/api/DeleteOrg/:orgId', async (req, res) => {
         try {
                 const orgId = req.params.orgId;
                 // Check if there are users attached to the organization before deleting
                 const usersCount = await db.query('SELECT COUNT(*) FROM "user" WHERE org_id = $1', [req.params.orgId]);
                if (usersCount.rows[0].count > 0) {
                     return res.status(400).json({ error: 'Cannot delete organization with attached users' });
                    }
                 // If no users attached, proceed with deletion
                 const result = await db.query('DELETE FROM organization WHERE org_id = $1 RETURNING *', [req.params.orgId]);
                 res.json(result.rows[0]);
            }
         catch (error)
         {
                 console.error(error);
                res.status(500).json({ error: 'Internal Server Error' });
                 }
  });
  
// Endpoint to view details of a user along with organization details
app.get('/api/ViewUsers/:userId/details', async (req, res) => {
            try {
                   const userId = req.params.userId;
                   const result = await db.query('SELECT u.*, o.* FROM "user" u INNER JOIN organization o ON u.org_id = o.org_id WHERE u.user_id = $1', [req.params.userId]);
                    if (result.rows.length === 0) {
                      return res.status(404).json({ error: 'User not found' });
                         }
                   res.json(result.rows[0]);
                } 
                catch (error)
                 {
                    console.error(error);
                    res.status(500).json({ error: 'Internal Server Error' });
                  }
  });

// Endpoint to get all users under a specific organization
  app.get('/api/AlluserInOrgs/:orgId/users', async (req, res) => {
    try {
      const orgId = req.params.orgId;
      
      // Check if the organization exists (you may want to add additional validation)
      const organizationExists = await db.query('SELECT 1 FROM organization WHERE org_id = $1', [req.params.orgId]);
      if (organizationExists.rows.length === 0) {
        return res.status(404).json({ error: 'Organization not found' });
      }
  
      const result = await db.query('SELECT * FROM "user" WHERE org_id = $1', [req.params.orgId]);
      res.json(result.rows);

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });










const port = process.env.PORT || 3001;
app.listen(port, () =>{
    console.log(`server is up in port  ${port}` )
});

