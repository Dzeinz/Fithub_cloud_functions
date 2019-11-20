# FitHub Cloud Functions

## Setup
1. Install & Configure Firebase CLI (https://firebase.google.com/docs/cli)
2. Clone this repo: (https://github.com/Dzeinz/Fithub_cloud_functions.git)
3. Install dependencies `npm install`

## Folder Structure
All the code for Cloud Functions will be stored in the `functions\src` folder.
- file names in the source folder will be used as the deployment name (ex. `functions\src\helloWorld.js` is deployed as `helloWorld`)

## Deployment
1. Deploy from the project's base folder using the Firebase CLI `firebase deploy --only functions`
