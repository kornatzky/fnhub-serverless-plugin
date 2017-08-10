# fnhub-serverless-plugin

A Serverless Plugin for fnhub. 

fnhub is a software registry for serverless functions. The plugin lets you include functions from fnhub in your serverless configuration. 

You can use other functions, not coming from fnhub, within your serverless configuration. 

Currently, supports AWS Lambda only.

# Installation 

    npm install --save-dev fnhub-serverless-plugin

Add to your `serverless.yml` file in the `plugins` section:

    plugins:
      - fnhub-serverless-plugin

# Commands

## Include

Include a given version of a published function from fnhub:

    serverless include --function functionname@functionversion

The function version may be `latest`, and if omitted defaults to `latest`.

Modifies your `serverless.yml` and adds a custom section (or appends to the existing one). The custom section includes the function, defines its environment variables as declared by the function creator. You should assign meaningful values to these environment variables, according to the function description.

The `zip` file for the function is downloaded to your local computer and will be used during serverless deployment.

## Deploy

As usual:

    serverless deploy

Deploys your services, including the functions coming from fnhub.