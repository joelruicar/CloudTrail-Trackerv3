# CloudTrail-Tracker-Dashboard 

CloudTrail-Tracker-Dashboard is a Vue 3 + TypeScript web portal built with Vite. It queries the REST API of [CloudTrail-Tracker](https://github.com/grycap/cloudtrail-tracker) to visually show high-level aggregate information about AWS resource usage by different users based on event data.

## Visual Aspect of the Dashboard
The dashboard depicts an aggregated view of the AWS services usage in a pre-defined time frame: 
![CloudTrail-Tracker Dashboard](doc/ctt-dashboard.png)

It also enables users to track their progress percentage across a series of laboratory activities. The set of events for each activity is defined in evenprac.js (src/data/evenprac.js). 
Clicking on each bar shows the user which events are missing for each lab activity. This is useful when using this tool for teaching Cloud Computing with Amazon Web Services academically.
![CloudTrail-Tracker Labs](doc/ctt-labs.png)

The Oteador panel provides useful information about the AWS account, including details and links to the services being utilised in a chosen region.
![CloudTrail-Tracker Oteador](doc/ctt-oteador.png)

In addition, teachers can access a dedicated panel where they can search for groups of students and view metrics such as progress, attendance and academic performance.
![CloudTrail-Tracker Group](doc/ctt-group.png)

An academic publication on the adoption of this tool as a learning dashboard for students is available in:

Naranjo, Diana M., José R. Prieto, Germán Moltó, and Amanda Calatrava. 2019. “A Visual Dashboard to Track Learning Analytics for Educational Cloud Computing.” Sensors 19(13): 2952. https://www.mdpi.com/1424-8220/19/13/2952/htm (July 4, 2019).

## Requirements

* An existing [Cognito User Pool](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-identity-pools.html) to store the  users, created in your AWS account.

* [Yarn](https://yarnpkg.com/) installed.

## Deployment

This is a static web application built with Vue 3, TypeScript and Vite. It compiles to plain static assets and is expected to be deployed in an S3 bucket.

1. Configure Cognito values in `src/amplifyConfig.ts` (see example in src/env_example.js) specifying the corresponding values (obtained from the Cognito User Pool).

    ``` js
    export const amplifyConfig = {
      Auth: {
        Cognito: {
          region: 'us-east-1',
          userPoolId: 'us-east-1_XXXXXXXXX',
          userPoolClientId: 'YYYYYYYYYYYYYYYYYYYYYYYYYY',
          identityPoolId: 'us-east-1:zzzzzzzz-zzzz-zzzz-zzzz-zzzzzzzzzzzz',
        },
      },
    }
    ```
  
2. Configure the API endpoints in `.env`.

3. Start a local server to verify the web application:
    1. Install the dependencies:

        ```sh
        yarn install
        ```

    1. Run the server in localhost

        ```sh
        yarn dev
        ```

    The web application will be available in `http://localhost:5173`

4. Create the static web site by issuing: 
    ```sh
    yarn install
    yarn build:ci
    ```
    The static web site will be available in the `dist` folder.

5. Upload the folder to an [S3 bucket with website configuration](https://docs.aws.amazon.com/AmazonS3/latest/dev/WebsiteHosting.html).

   If you use CloudFront in front of S3, configure custom error responses so `403` and `404` return `/index.html` with HTTP `200`.


## Contributing

Before contributing to this project, you should be familiar with [Amazon Cognito](http://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html), [Vue.js](https://vuejs.org/) and [Vite](https://vite.dev/)