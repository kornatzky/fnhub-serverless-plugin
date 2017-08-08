# fnhub-serverless-plugin

A Serverless Plugin for fnhub. 

fnhub is a software registry for serverless functions. The plugin lets you include functions from fnhub in your serverless configuration. 

Currently, supports AWS Lambda only.

# Commands

## Include

    serverless include --function functionname@functionversion

Modifies your `serverless.yml` and adds a custom section (or appends to the existing one). The custom section includes the function, defines its environment variables as declared by the function creator. You should assign meaningful values to these environment variables, according to the function description.

## Deploy

As usual:

    serverless deploy

Deploys your services, including the functions coming from fnhub.