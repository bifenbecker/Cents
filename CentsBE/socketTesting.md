### Code Set-up:

Install postgresql, mongoDb, node (v10.16.0). Clone the project from github and fetch socket brach.
After fetching the branch, install all the dependencies using npm i. Add an env file, refer to
.env.test for the environment variable names. After the installation of dependencies, run the
migrations using npx knex migrate:latest. The run the seeder files. After doing so add data manually
to laundromatBusiness, stores, devices, machines and pairing tables. Add public key to a device in
devices table( provided in socket test scripts/serverKeys.js file).

To start the server open terminal and type node index.js. Use this doc for reference :
https://docs.google.com/document/d/1G3gTpM_ahsmE_RRs1UY7nOdfHOhz5vJkzfcWDSeLFSg/edit To run client
and machine scripts, navigate to socket test scripts directory Run machine.js file by typing node
machine.js in the terminal, followed by node client.js.
