module.exports = {
  backand:{
    appName: 'funhub',
    anonymousToken: 'f10673bb-d12a-4245-8eca-312add606059'
  },
  codeZipFileName: 'module.zip',
  serverlessFileName: 'serverless.yml',
  fnhubFolder: '.fnhub',
  analytics:{
    //key: 'BDCFyVrRyqjnGE4Cu1xe5ziPErtcPkHj', //test
    key: 'B9HnYlGFEZGQ99PkivFxE4kK4M8PKk3B', //prod
    anonymousId: 'cli@backand.io'
  },
  debug:{
    log: true
  },
  git:{
    forceCommit: true
  },   
  aws:{
    s3:{
      host: 'https://s3.amazonaws.com/',
      bucket:'fnhub.backand.io'
    },
  }
};
