# CentsBE

## Setup
  1. Copy a test config `cp .env.test .env`
  2. Update the `DATA_PATH` variable with the path of the folder where you want data (Postgres, Redis, Elastic. MongoDB) to persist. Ex: `../data-CentsBE`.
  3. Start stack with `docker-compose up` or `docker-compose up -d`.

  Docker will build and and the main app will start in testing mode, witout main node process.

  To run tests do:
  1. `docker ps`
  2. Note `CONTAINER ID` or `NAMES` of `centsbe_main-app`
  3. Run `test-setup`* if have not run yet
   > `docker exec -it <CONTAINER ID or NAME> npm run test-setup`
  4. Run all** tests with command
   > `docker exec -it <CONTAINER ID or NAME> npm run test`

  **NOTES**
  > *Run `test-setup` command in two scenarios
  >  1. To setup test DB for the first time 
  >  2. When there are changes in migrations
  > 
  > **To run a single test file
  >  1. update the file path in spec in `.mocharc.json` and run command:
  >  2. run `docker exec -it <CONTAINER ID or NAME> npm run test`

## Set up test cases:

We are using Mocha framework with chai library for test cases

    Mocha - https://mochajs.org/

    Chai - https://www.chaijs.com/api/

### Writing test cases:

  **Code Organisation**

  Below is a high level representation of the folder structure of CentsBE

    ```
    CentsBE
    ├── routes
    │   ├── employeeTab
    │   ├── businessOwner
    │   └── driverApp
    ├── pipeline
    │   ├── customer
    │   ├── driverApp
    │   ├── employeeApp
    │   └── pipeline.js
    ├── uow
    │   ├── customer
    │   ├── driverApp
    │   └── liveLink
    ├── test
    │   ├── factories
    │   ├── integration
    │   │   ├── employeeTab
    │   │   ├── businessOwner
    │   │   └── liveLink
    │   ├── setup
    │   ├── support
    │   ├── testHelper.js
    │   └── unit
    │       ├── model
    │       ├── pipeline
    │       └── uow
    ├── README.md
    ├── package.json
    └── package-lock.json
    ```


#### 1. **Factories Creation:**
  1. we are using factories to define and build objects using the models for accurate testing. factories work asynchronously and supports associations and the use of functions for generating attributes.
   
  > https://github.com/simonexmachina/factory-girl/blob/master/README.md  
  > NOTE: File name should be plural for factory
  
  2. create the factories for each model required for the testing in factories folder.
#### 2. **Integration Test cases**
  1. all the integration test cases should be written in the Integration folder with the same folder structure as in routes folder.
  2. Integration test cases should cover authentication, api validations, and response.

#### 3. **Unit Test cases:**
  Unit test cases include models, pipeline and uow test cases.

  - Model Test cases:

      In Model test cases we cover:

      1. if the table is created
      2. if the associations of the model are there
  - UOW Test cases(business logic):

      1. In UOW test cases we test individual UOW. follow the same folder structure as in UOW folder
  - Pipeline Test cases:
  
      1. In pipeline test cases we test if the pipeline function is being called or not when we hit the api
      
      NOTE: In TODO

#### Github Actions Test Runs:
- To parallelize our tests in separate containers, unit tests should be all placed under `test/unit` while integration tests are placed under `test/integration`. When we decide to parallelize further, we can continue to break up tests into categories to keep the runs organized (ex: `test/unit/model`).
- Test results as well as coverage will now be uploaded to github actions under the workflow's 'artificats'. See https://docs.github.com/en/actions/managing-workflow-runs/downloading-workflow-artifacts for more info on how to download artificats.

#### Other notes:
- After each test case execution is done, mocha will call the after hook in `setup/trucateDB.js` which will clear the DB

- We are maintaining `.mocharc.json` file for mocha configurations. This is placed in the root folder. Mocha by default will check in the root folder, we can also place this file whereever we want and give path of that file in `npm test` command

## Test Coverage
  To check the tested code coverage:
  > Running `npm test` will create a folder `coverage`. You can check the coverage in `coverage/index.html` file.
  >
  > This folder should be included in this project's .gitignore.
        
