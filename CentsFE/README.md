
# CentsFE
Cents is a turnkey solution to build, grow, manage, and scale the laundromats business. It is an all-in-one solution for modernized payments, employee management, machine tracking, plant/hub operations, delivery, and more.

CentsFE is a web application aims to provide an interface to the Cents Administrators for managing business owners, device allocation, etc. This also allows the Laundromat Owners / Admins to manage various aspects of their business including stores and details, employees, tasks, services and products, pricing, payment settings etc.

<hr/>

### Technology
This project is a React application bootstrapped with create-react-app. So all the commands of it work here as well. 

#### Package management
We are using <b>`yarn`</b> as our package manager. So please refrain from using npm (becuase this will leave outdated yarn.lock and create package cache issues)

#### Tech stack
- ReactJs 16.8
- Redux 4.0
- React-Hooks
- React-Router
- Axios 
- SCSS
- NodeJs 10 or 12 LTS

<hr/>

#### Environments



| Environment | Git Branch | URL                                                    | BE URL                                                           | CD Enabled              | S3 bucket          | Cloudfront enabled |
|-------------|------------|--------------------------------------------------------|------------------------------------------------------------------|-------------------------|--------------------|--------------------|
| Production  | master     | https://admin.trycents.com/                            | https://api3.trycents.com/api/v1/                                | No                      | admin.trycents.com | Yes                |
| Dev         | dev        | http://admin-dev.trycents.dev/                         | https://dev-admin-api.trycents.com/api/v1                        | Yes - GitHub Actions    | cents-fe-dev       | Yes                |
| QA          | qa         | http://cents-qa-fe.s3-website.us-east-2.amazonaws.com/ | http://elb-qa-nsg-1003890426.us-east-2.elb.amazonaws.com/api/v1/ | Yes - AWS Code Pipeline | cents-qa-fe        | No                 |

Note : Please make sure to provide a .env file with variables as given in .env.example with appropriate values for the environment to which you are building

<br/>
<hr/>

#### Useful commands
- `yarn start` - Start the developemnt server
- `yarn build` - Create a production optimised build
- `yarn test`  - Run tests 

<br/><hr/><br/>

## Code Organisation
Below is a high level representation of the folder structure of CentsFE
```
CentsFE
├── public
│   ├── favicon.ico
│   ├── index.html
│   └── manifest.json
├── src
│   ├── api
│   ├── assets
│   ├── components
│   ├── containers
│   ├── reducers
│   ├── socket
│   ├── tests
│   ├── utils
│   ├── App.js
│   ├── Routes.js
│   ├── actionTypes.js
│   ├── constants.js
│   ├── global.scss
│   ├── index.js
│   ├── serviceWorker.js
│   └── store.js
├── README.md
├── buildspec.yml
├── package.json
├── yarn-error.log
└── yarn.lock
```

All of the hand written code almost always lives only in `src`. Below is the one line description of different folders in `src`

- `api` - Contains axios fucntions for accesing different endpoints in the BE
- `assets` - Contains static assets like images, fonts, styles, etc.
- `components` - Conatains UI related code, mostly representational and a few Pages which rely on redux for data and hold UI logic
- `containers` - Containers form the link between Components and Redux state. Most of the business logic also lives in containers
- `reducers` - Redux reducers
- `sockets` - Like `api` files but for socket.io connections
- `tests` - Contains test cases
- `utils` - Utility fucntions used and re-used in various places

<br/><hr/>

## Version Control
This project uses `Git` for version control and also follows standard git flow and branching model

### Branches
#### Main Branches
- `master` - The trunk, its the default branch and production is pointed to this branch
- `dev` - This is being used as staging, So anything here will eventually end up in prod
- `qa` - This branch is used to handover the feature to QA team
#### Other Branches
These branches should be always linked with a Jira Issue
- `feature/{JIRA-ticket}` - Used to develop independent features, can be merged with a PR to QA and DEV
- `hotfix/{JIRA-ticket}` - Used to fix any high priority issues, which need to go to production asap
- `bugfix/{JIRA-ticket}` - Used to fix issues/bugs which can be deployed to production along with next planned release


Note: Please read more about the philosophy behind git practices [here](https://docs.google.com/document/d/1QPQkWLGVk3_hvSS76CSybIlbTsZjSjXWRU46GDtpPPw/edit?usp=sharing)
