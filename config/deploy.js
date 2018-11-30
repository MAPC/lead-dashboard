/* jshint node: true */
'use strict';

module.exports = function(deployTarget) {
  let ENV = {
    build: {
      environment: deployTarget,
    },

    'revision-data': {
      type: 'git-commit',
    },
  };

  if (deployTarget === 'staging') {
    ENV.rsync = {
      dest: 'lead-dashboard@prep.mapc.org:/var/www/lead-dashboard',
      delete: false,
    };
  }

  if (deployTarget === 'production') {
    ENV.rsync = {
      dest: 'lead-dashboard@live.mapc.org:/var/www/lead-dashboard',
      delete: false,
    };
  }

  return ENV;
};
