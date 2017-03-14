module.exports = function(deployTarget) {  
  return {
    pagefront: {
      app: 'leap',
      key: process.env.PAGEFRONT_KEY
    }
  };
};
